import { useState, useCallback } from 'react';
import { UploadedFile, ProcessingResult } from '../types';

export const useFileUpload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const uploadFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are supported');
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('File size must be less than 50MB');
    }

    const uploadedFile: UploadedFile = {
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      status: 'uploading',
      progress: 0,
    };

    setFiles(prev => [...prev, uploadedFile]);
    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Update to processing status
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'processing', progress: 10 }
          : f
      ));

      // Send to backend API
      const response = await fetch('http://34.101.179.14:3001/api/process-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();

      if (result.success) {
        // Update with results
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { 
                ...f, 
                status: 'completed', 
                progress: 100,
                pages: result.data.totalPages,
                results: result.data.results
              }
            : f
        ));
      } else {
        throw new Error(result.message || 'Processing failed');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed' 
            }
          : f
      ));
    } finally {
      setIsUploading(false);
    }
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
  }, []);

  return {
    files,
    isUploading,
    uploadFile,
    removeFile,
    clearAll,
  };
};
