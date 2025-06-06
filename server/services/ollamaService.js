import axios from 'axios';

class OllamaService {
  constructor() {
    this.baseURL = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'qwen2.5vl:7b';
    this.modelText = process.env.OLLAMA_MODEL || 'deepseek-r1:8b';
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

  async generateDocumentSummary(pageAnalyses, documentName) {
    try {
      // Combine all page analyses into a single text
      const combinedAnalyses = pageAnalyses
        .map((result, index) => `Page ${index + 1}: ${result.analysis}`)
        .join('\n\n');

      const summaryPrompt = `Based on the following page-by-page analysis of the document "${documentName}", provide a comprehensive document summary:

${combinedAnalyses}

Please provide:
1. **Executive Summary**: A brief overview of the entire document (2-3 sentences)
2. **Main Topics**: Key themes and subjects covered throughout the document
3. **Key Findings**: Important insights, data points, or conclusions
4. **Document Structure**: How the document is organized and its flow
5. **Notable Elements**: Any significant charts, tables, images, or special formatting
6. **Content Quality**: Assessment of the document's clarity, completeness, and usefulness
7. **Recommendations**: Suggested actions or next steps based on the content (if applicable)
8. if the document is profit and loss statement or balance sheet, provide the information and data in the table format, the table should use the period statement as the column
9. if the document is deed of establishment legal document, specify all of the director name, the director birth date, and the deed of establishment date

Format your response clearly with headers and bullet points where appropriate.`;

      const requestBody = {
        model: this.modelText, // Use text model for summary
        prompt: summaryPrompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
          top_k: 40,
          num_predict: 1000 // Allow longer responses for comprehensive summaries
        }
      };

      console.log('Generating document summary...');
      
      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        requestBody,
        {
          timeout: this.timeout * 2, // Double timeout for summary generation
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.response) {
        return {
          success: true,
          summary: response.data.response.trim(),
          model: requestBody.model,
          processingTime: response.data.total_duration || 0
        };
      } else {
        throw new Error('Invalid response from Ollama for summary generation');
      }

    } catch (error) {
      console.error('Document summary generation error:', error.message);
      
      // Fallback to basic summary if AI fails
      const fallbackSummary = this.generateFallbackSummary(pageAnalyses, documentName);
      
      return {
        success: false,
        summary: fallbackSummary,
        error: error.message,
        fallback: true
      };
    }
  }

  generateFallbackSummary(pageAnalyses, documentName) {
    const totalPages = pageAnalyses.length;
    const avgConfidence = pageAnalyses.reduce((sum, result) => sum + (result.confidence || 0), 0) / totalPages;
    
    return `Document Summary for "${documentName}"

**Executive Summary**: This ${totalPages}-page document has been processed and analyzed. The content appears to be well-structured with an average confidence score of ${(avgConfidence * 100).toFixed(1)}%.

**Document Statistics**:
- Total Pages: ${totalPages}
- Processing Status: ${pageAnalyses.filter(r => !r.error).length} pages successfully analyzed
- Average Confidence: ${(avgConfidence * 100).toFixed(1)}%

**Content Overview**: The document contains various types of content across its ${totalPages} pages. Each page has been individually analyzed for content, structure, and key information.

**Note**: This is a basic summary generated due to AI processing limitations. For detailed insights, please review the individual page analyses.`;
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