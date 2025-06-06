import pdf2pic from 'pdf2pic';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ollamaService } from './ollamaService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function processDocument(filePath, fileName) {
  console.log(`Starting document processing for: ${fileName}`);
  
  try {
    // Create temporary directory for images
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Configure pdf2pic
    const convert = pdf2pic.fromPath(filePath, {
      density: 200,           // DPI for image quality
      saveFilename: "page",
      savePath: tempDir,
      format: "png",
      width: 1200,           // Max width
      height: 1600           // Max height
    });

    console.log('Converting PDF to images...');
    
    // Get PDF info to determine page count
    const pdfInfo = await convert.bulk(-1, { responseType: "base64" });
    const totalPages = pdfInfo.length;
    
    console.log(`PDF has ${totalPages} pages. Processing each page...`);

    const results = [];

    // Process each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}/${totalPages}...`);
        
        // Convert single page to base64
        const pageResult = await convert(pageNum, { responseType: "base64" });
        
        if (!pageResult || !pageResult.base64) {
          console.warn(`Failed to convert page ${pageNum} to image`);
          continue;
        }

        // Analyze with Ollama
        const startTime = Date.now();
        const analysis = await ollamaService.analyzeImage(pageResult.base64);
        const processingTime = Date.now() - startTime;

        if (analysis.success) {
          results.push({
            pageNumber: pageNum,
            imageUrl: `data:image/png;base64,${pageResult.base64}`,
            analysis: analysis.analysis,
            confidence: 0.85 + Math.random() * 0.14, // Simulated confidence score
            processingTime: processingTime,
            model: analysis.model
          });
          
          console.log(`Page ${pageNum} processed successfully (${processingTime}ms)`);
        } else {
          console.error(`Failed to analyze page ${pageNum}`);
          results.push({
            pageNumber: pageNum,
            imageUrl: `data:image/png;base64,${pageResult.base64}`,
            analysis: 'Failed to analyze this page',
            confidence: 0,
            processingTime: processingTime,
            error: 'Analysis failed'
          });
        }

      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError.message);
        results.push({
          pageNumber: pageNum,
          imageUrl: null,
          analysis: `Error processing page: ${pageError.message}`,
          confidence: 0,
          processingTime: 0,
          error: pageError.message
        });
      }
    }

    // Clean up temporary files
    try {
      const tempFiles = fs.readdirSync(tempDir);
      tempFiles.forEach(file => {
        if (file.startsWith('page')) {
          fs.unlinkSync(path.join(tempDir, file));
        }
      });
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary files:', cleanupError.message);
    }

    console.log(`Document processing completed. Processed ${results.length} pages.`);
    return results;

  } catch (error) {
    console.error('Document processing error:', error);
    throw new Error(`Failed to process document: ${error.message}`);
  }
}