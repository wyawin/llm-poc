# Ollama Document Processing Frontend

A modern web application for processing PDF documents using Ollama AI. Upload PDFs and get AI-powered analysis of each page with detailed insights.

## Features

- **PDF Upload**: Drag-and-drop or click to upload PDF documents
- **AI Analysis**: Each page is analyzed using Ollama's vision models
- **Real-time Processing**: Watch as your document is processed page by page
- **Detailed Results**: Get comprehensive analysis for each page
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v18 or higher)
2. **Ollama** installed and running
3. **A vision model** pulled in Ollama (recommended: `llava:latest`)

### Setting up Ollama

1. Install Ollama from [https://ollama.ai](https://ollama.ai)
2. Pull a vision model:
   ```bash
   ollama pull llava:latest
   ```
3. Verify Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ollama-document-processor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

To run both frontend and backend simultaneously:

```bash
npm run dev:full
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:5173`

### Running Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run dev
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory to customize settings:

```env
# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llava:latest
OLLAMA_TIMEOUT=120000

# Server Configuration
PORT=3001
```

### Supported Models

The application works best with vision-capable models:
- `llava:latest` (recommended)
- `llava:7b`
- `llava:13b`
- `bakllava:latest`

## API Endpoints

### Backend API

- `GET /api/health` - Check server and Ollama status
- `POST /api/process-document` - Upload and process PDF document

### Example API Usage

```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('http://localhost:3001/api/process-document', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
```

## How It Works

1. **Upload**: User uploads a PDF document through the web interface
2. **Conversion**: Backend converts each PDF page to a high-quality PNG image
3. **Analysis**: Each image is sent to Ollama for AI analysis
4. **Results**: Detailed analysis results are returned and displayed

## File Structure

```
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript type definitions
├── server/                # Backend Node.js server
│   ├── services/          # Business logic services
│   └── config/            # Configuration files
└── package.json           # Dependencies and scripts
```

## Troubleshooting

### Common Issues

1. **Ollama Connection Failed**
   - Ensure Ollama is running: `ollama serve`
   - Check if the model is available: `ollama list`
   - Verify the Ollama URL in configuration

2. **PDF Processing Errors**
   - Ensure the PDF is not corrupted
   - Check file size (max 50MB)
   - Verify sufficient disk space for temporary files

3. **Memory Issues**
   - Large PDFs may require more memory
   - Consider processing smaller documents or increasing Node.js memory limit

### Performance Tips

- Use smaller, optimized PDFs for faster processing
- Ensure Ollama has sufficient system resources
- Consider using lighter models for faster processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.