import axios from 'axios';

class OllamaService {
  constructor() {
    this.baseURL = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'qwen2.5vl:7b';
    this.timeout = 120000; // 2 minutes timeout
  }

  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000
      });
      
      const hasModel = response.data.models?.some(model => 
        model.name.includes('llava') || model.name.includes('vision')
      );

      return {
        status: 'connected',
        url: this.baseURL,
        model: this.model,
        hasVisionModel: hasModel,
        availableModels: response.data.models?.map(m => m.name) || []
      };
    } catch (error) {
      console.error('Ollama health check failed:', error.message);
      return {
        status: 'disconnected',
        url: this.baseURL,
        error: error.message
      };
    }
  }

  async analyzeImage(imageBase64, prompt = null) {
    try {
      const defaultPrompt = `Analyze this document page image in detail. Provide:
1. A summary of the main content and topics
2. Key information, data, or insights found
3. Document structure and formatting observations
4. Any notable elements like tables, charts, or images
5. Overall assessment of the content quality and readability

Be thorough and specific in your analysis.`;

      const requestBody = {
        model: this.model,
        prompt: prompt || defaultPrompt,
        images: [imageBase64],
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
          top_k: 40
        }
      };

      console.log(`Sending request to Ollama: ${this.baseURL}/api/generate`);
      
      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        requestBody,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.response) {
        return {
          success: true,
          analysis: response.data.response.trim(),
          model: this.model,
          processingTime: response.data.total_duration || 0
        };
      } else {
        throw new Error('Invalid response from Ollama');
      }

    } catch (error) {
      console.error('Ollama analysis error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Ollama. Make sure Ollama is running and accessible.');
      } else if (error.response?.status === 404) {
        throw new Error(`Model '${this.model}' not found. Please pull the model first: ollama pull ${this.model}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Ollama request timed out. The image might be too complex or the model is overloaded.');
      }
      
      throw new Error(`Ollama analysis failed: ${error.message}`);
    }
  }

  async listModels() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error.message);
      return [];
    }
  }
}

export const ollamaService = new OllamaService();