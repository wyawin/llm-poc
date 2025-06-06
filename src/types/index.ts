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