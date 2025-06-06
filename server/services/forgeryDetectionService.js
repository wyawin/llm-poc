import pdf2pic from 'pdf2pic';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ollamaService } from './ollamaService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function detectDocumentForgery(filePath, fileName) {
  console.log(`Starting forgery detection for: ${fileName}`);
  
  try {
    // Create temporary directory for images
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Configure pdf2pic
    const convert = pdf2pic.fromPath(filePath, {
      density: 300,           // Higher DPI for better forgery detection
      saveFilename: "forgery_page",
      savePath: tempDir,
      format: "png",
      width: 1600,           // Higher resolution for detailed analysis
      height: 2000
    });

    console.log('Converting PDF to high-resolution images for forgery analysis...');
    
    // Get PDF info to determine page count
    const pdfInfo = await convert.bulk(-1, { responseType: "base64" });
    const totalPages = pdfInfo.length;
    
    console.log(`PDF has ${totalPages} pages. Analyzing each page for forgery indicators...`);

    const results = [];

    // Process each page for forgery detection
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        console.log(`Analyzing page ${pageNum}/${totalPages} for forgery...`);
        
        // Convert single page to base64
        const pageResult = await convert(pageNum, { responseType: "base64" });
        
        if (!pageResult || !pageResult.base64) {
          console.warn(`Failed to convert page ${pageNum} to image`);
          continue;
        }

        // Analyze with Ollama for forgery detection
        const startTime = Date.now();
        const forgeryAnalysis = await ollamaService.detectForgery(pageResult.base64);
        const processingTime = Date.now() - startTime;

        if (forgeryAnalysis.success) {
          results.push({
            pageNumber: pageNum,
            imageUrl: `data:image/png;base64,${pageResult.base64}`,
            forgeryAnalysis: forgeryAnalysis.analysis,
            overallRiskScore: forgeryAnalysis.riskScore,
            processingTime: processingTime,
            model: forgeryAnalysis.model
          });
          
          console.log(`Page ${pageNum} forgery analysis completed (${processingTime}ms) - Risk Score: ${forgeryAnalysis.riskScore}%`);
        } else {
          console.error(`Failed to analyze page ${pageNum} for forgery`);
          results.push({
            pageNumber: pageNum,
            imageUrl: `data:image/png;base64,${pageResult.base64}`,
            forgeryAnalysis: {
              fontAnalysis: { fontConsistency: 0, suspiciousCharacters: [], fontMixingDetected: false, digitalFontIndicators: [], analysis: 'Analysis failed' },
              spacingAnalysis: { letterSpacing: 0, wordSpacing: 0, lineSpacing: 0, irregularities: [], suspiciousPatterns: [], analysis: 'Analysis failed' },
              imageQualityAnalysis: { resolution: 'Unknown', compressionArtifacts: false, digitalManipulationSigns: [], pixelationIssues: false, analysis: 'Analysis failed' },
              structuralAnalysis: { alignmentIssues: [], marginInconsistencies: false, layoutAnomalies: [], watermarkAnalysis: 'Unknown', analysis: 'Analysis failed' },
              overallAssessment: 'Failed to analyze this page for forgery indicators',
              riskFactors: ['Analysis failure'],
              authenticityScore: 0
            },
            overallRiskScore: 100,
            processingTime: processingTime,
            error: 'Forgery analysis failed'
          });
        }

      } catch (pageError) {
        console.error(`Error processing page ${pageNum} for forgery:`, pageError.message);
        results.push({
          pageNumber: pageNum,
          imageUrl: null,
          forgeryAnalysis: {
            fontAnalysis: { fontConsistency: 0, suspiciousCharacters: [], fontMixingDetected: false, digitalFontIndicators: [], analysis: 'Processing error' },
            spacingAnalysis: { letterSpacing: 0, wordSpacing: 0, lineSpacing: 0, irregularities: [], suspiciousPatterns: [], analysis: 'Processing error' },
            imageQualityAnalysis: { resolution: 'Unknown', compressionArtifacts: false, digitalManipulationSigns: [], pixelationIssues: false, analysis: 'Processing error' },
            structuralAnalysis: { alignmentIssues: [], marginInconsistencies: false, layoutAnomalies: [], watermarkAnalysis: 'Unknown', analysis: 'Processing error' },
            overallAssessment: `Error processing page: ${pageError.message}`,
            riskFactors: ['Processing error'],
            authenticityScore: 0
          },
          overallRiskScore: 100,
          processingTime: 0,
          error: pageError.message
        });
      }
    }

    // Clean up temporary files
    try {
      const tempFiles = fs.readdirSync(tempDir);
      tempFiles.forEach(file => {
        if (file.startsWith('forgery_page')) {
          fs.unlinkSync(path.join(tempDir, file));
        }
      });
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary files:', cleanupError.message);
    }

    console.log(`Forgery detection completed. Analyzed ${results.length} pages.`);
    
    return {
      results: results,
      totalPages: results.length,
      fileName: fileName,
      processingStats: {
        successfulPages: results.filter(r => !r.error).length,
        failedPages: results.filter(r => r.error).length,
        averageRiskScore: results.reduce((sum, r) => sum + (r.overallRiskScore || 0), 0) / results.length,
        totalProcessingTime: results.reduce((sum, r) => sum + (r.processingTime || 0), 0)
      }
    };

  } catch (error) {
    console.error('Forgery detection error:', error);
    throw new Error(`Failed to detect forgery: ${error.message}`);
  }
}