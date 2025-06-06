export const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  
  // Ollama configuration
  ollama: {
    url: process.env.OLLAMA_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llava:latest',
    timeout: parseInt(process.env.OLLAMA_TIMEOUT) || 120000,
  },
  
  // File upload configuration
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['application/pdf'],
    uploadDir: './uploads'
  },
  
  // PDF processing configuration
  pdf: {
    density: 200,
    maxWidth: 1200,
    maxHeight: 1600,
    format: 'png'
  }
};