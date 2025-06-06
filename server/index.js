import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { processDocument } from './services/documentProcessor.js';
import { detectDocumentForgery } from './services/forgeryDetectionService.js';
import { ollamaService } from './services/ollamaService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const ollamaStatus = await ollamaService.checkHealth();
    res.json({
      success: true,
      message: 'Server is running',
      ollama: ollamaStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Document upload and processing endpoint
app.post('/api/process-document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    console.log(`Processing document: ${fileName}`);

    // Process the document
    const processedDocument = await processDocument(filePath, fileName);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Document processed successfully',
      data: {
        fileName: processedDocument.fileName,
        totalPages: processedDocument.totalPages,
        results: processedDocument.pages,
        summary: processedDocument.summary,
        stats: processedDocument.processingStats
      }
    });

  } catch (error) {
    console.error('Error processing document:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error processing document',
      error: error.message
    });
  }
});

// Forgery detection endpoint
app.post('/api/detect-forgery', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    console.log(`Detecting forgery in document: ${fileName}`);

    // Detect forgery in the document
    const forgeryResults = await detectDocumentForgery(filePath, fileName);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Forgery detection completed successfully',
      data: {
        fileName: forgeryResults.fileName,
        totalPages: forgeryResults.totalPages,
        results: forgeryResults.results,
        stats: forgeryResults.processingStats
      }
    });

  } catch (error) {
    console.error('Error detecting forgery:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error detecting forgery',
      error: error.message
    });
  }
});

// Get processing status endpoint (for real-time updates)
app.get('/api/processing-status/:jobId', (req, res) => {
  // This would be implemented with a job queue system in production
  res.json({
    success: true,
    status: 'completed',
    progress: 100
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Document processing: http://localhost:${PORT}/api/process-document`);
  console.log(`Forgery detection: http://localhost:${PORT}/api/detect-forgery`);
});