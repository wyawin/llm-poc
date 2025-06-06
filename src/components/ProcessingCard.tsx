import React, { useState } from 'react';
import { UploadedFile } from '../types';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Eye,
  Trash2,
  Download
} from 'lucide-react';

interface ProcessingCardProps {
  file: UploadedFile;
  onRemove: (fileId: string) => void;
}

export const ProcessingCard: React.FC<ProcessingCardProps> = ({ file, onRemove }) => {
  const getStatusIcon = () => {
    switch (file.status) {
      case 'uploading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (file.status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return `Processing page ${Math.ceil((file.progress / 100) * (file.pages || 1))} of ${file.pages || 1}`;
      case 'completed':
        return `Completed • ${file.results?.length || 0} pages processed`;
      case 'error':
        return file.error || 'Processing failed';
      default:
        return 'Pending';
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const [selected, setSelected] = useState<null | typeof file.results[0]>(null);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 truncate max-w-xs">
                {file.name}
              </h3>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <button
              onClick={() => onRemove(file.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{getStatusText()}</span>
            <span>{Math.round(file.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                file.status === 'error' ? 'bg-red-500' : 'bg-blue-600'
              }`}
              style={{ width: `${file.progress}%` }}
            />
          </div>
        </div>

        {file.status === 'completed' && file.results && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Processing Results</h4>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64">
              {file.results.slice(0, 10).map((result) => (
                <div
                  key={result.pageNumber}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      Page {result.pageNumber}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(result.confidence * 100).toFixed(1)}% confident
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-3">
                    {result.analysis}
                  </p>
            <button
              onClick={() => setSelected(result)}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              More
            </button>
                </div>
              ))}
            </div>
            
            {file.results.length > 10 && (
              <p className="text-sm text-gray-500 text-center">
                And {file.results.length - 10} more pages...
              </p>
            )}
          </div>
        )}
	<div className="my-4">
          {selected && (<pre className="whitespace-pre-wrap break-words text-sm text-black">{selected.analysis}</pre>)}
	</div>
      </div>
    </div>
  );
};
