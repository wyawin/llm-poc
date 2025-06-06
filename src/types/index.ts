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
  error?: string;
}

export interface ProcessingResult {
  pageNumber: number;
  imageUrl: string;
  analysis: string;
  confidence: number;
  processingTime: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}