export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  pages?: number;
  results?: ProcessingResult[];
  forgeryResults?: ForgeryAnalysisResult[];
  summary?: DocumentSummary;
  stats?: ProcessingStats;
  error?: string;
}

export interface ProcessingResult {
  pageNumber: number;
  imageUrl: string;
  analysis: string;
  confidence: number;
  processingTime: number;
  model?: string;
  error?: string;
}

export interface ForgeryAnalysisResult {
  pageNumber: number;
  imageUrl: string;
  forgeryAnalysis: ForgeryDetection;
  overallRiskScore: number;
  processingTime: number;
  model?: string;
  error?: string;
}

export interface ForgeryDetection {
  fontAnalysis: FontAnalysis;
  spacingAnalysis: SpacingAnalysis;
  imageQualityAnalysis: ImageQualityAnalysis;
  structuralAnalysis: StructuralAnalysis;
  overallAssessment: string;
  riskFactors: string[];
  authenticityScore: number;
}

export interface FontAnalysis {
  fontConsistency: number;
  suspiciousCharacters: string[];
  fontMixingDetected: boolean;
  digitalFontIndicators: string[];
  analysis: string;
}

export interface SpacingAnalysis {
  letterSpacing: number;
  wordSpacing: number;
  lineSpacing: number;
  irregularities: string[];
  suspiciousPatterns: string[];
  analysis: string;
}

export interface ImageQualityAnalysis {
  resolution: string;
  compressionArtifacts: boolean;
  digitalManipulationSigns: string[];
  pixelationIssues: boolean;
  analysis: string;
}

export interface StructuralAnalysis {
  alignmentIssues: string[];
  marginInconsistencies: boolean;
  layoutAnomalies: string[];
  watermarkAnalysis: string;
  analysis: string;
}

export interface DocumentSummary {
  content: string;
  model?: string;
  processingTime?: number;
  success: boolean;
  fallback?: boolean;
  error?: string;
}

export interface ProcessingStats {
  successfulPages: number;
  failedPages: number;
  averageConfidence: number;
  totalProcessingTime: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export type AnalysisType = 'content' | 'forgery';