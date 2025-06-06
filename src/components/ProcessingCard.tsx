import React, { useState } from 'react';
import { UploadedFile, AnalysisType } from '../types';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Eye,
  Trash2,
  Download,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Shield
} from 'lucide-react';
import { ForgeryResultsCard } from './ForgeryResultsCard';

interface ProcessingCardProps {
  file: UploadedFile;
  onRemove: (fileId: string) => void;
  analysisType: AnalysisType;
}

export const ProcessingCard: React.FC<ProcessingCardProps> = ({ file, onRemove, analysisType }) => {
  const [showSummary, setShowSummary] = useState(false);
  const [showPages, setShowPages] = useState(false);
  const [showForgeryResults, setShowForgeryResults] = useState(false);

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
        const totalPages = analysisType === 'content' ? (file.pages || 1) : (file.pages || 1);
        return `Processing page ${Math.ceil((file.progress / 100) * totalPages)} of ${totalPages}`;
      case 'completed':
        if (analysisType === 'content') {
          return `Completed • ${file.results?.length || 0} pages processed`;
        } else {
          return `Completed • ${file.forgeryResults?.length || 0} pages analyzed for forgery`;
        }
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

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const [selected, setSelected] = useState<null | typeof file.results[0]>(null);

  // Show forgery results if analysis type is forgery and we have results
  if (analysisType === 'forgery' && file.status === 'completed' && file.forgeryResults) {
    return <ForgeryResultsCard results={file.forgeryResults} fileName={file.name} />;
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              analysisType === 'content' ? 'bg-blue-50' : 'bg-red-50'
            }`}>
              {analysisType === 'content' ? (
                <FileText className="h-6 w-6 text-blue-600" />
              ) : (
                <Shield className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 truncate max-w-xs">
                {file.name}
              </h3>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleTimeString()}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  analysisType === 'content' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {analysisType === 'content' ? 'Content Analysis' : 'Forgery Detection'}
                </span>
              </div>
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
                file.status === 'error' ? 'bg-red-500' : 
                analysisType === 'content' ? 'bg-blue-600' : 'bg-red-600'
              }`}
              style={{ width: `${file.progress}%` }}
            />
          </div>
        </div>

        {/* Processing Stats */}
        {file.status === 'completed' && file.stats && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Processing Statistics</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>Success Rate: {((file.stats.successfulPages / (file.stats.successfulPages + file.stats.failedPages)) * 100).toFixed(1)}%</div>
              <div>Avg Confidence: {(file.stats.averageConfidence * 100).toFixed(1)}%</div>
              <div>Total Time: {formatProcessingTime(file.stats.totalProcessingTime)}</div>
              <div>Pages: {file.stats.successfulPages}/{file.stats.successfulPages + file.stats.failedPages}</div>
            </div>
          </div>
        )}

        {/* Document Summary - Only for content analysis */}
        {analysisType === 'content' && file.status === 'completed' && file.summary && (
          <div className="mb-4">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="flex items-center justify-between w-full p-3 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg hover:from-blue-100 hover:to-emerald-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Document Summary</span>
                {file.summary.fallback && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Fallback</span>
                )}
              </div>
              {showSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showSummary && (
              <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                    {file.summary.content}
                  </div>
                </div>
                {file.summary.processingTime && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    Summary generated in {formatProcessingTime(file.summary.processingTime)}
                    {file.summary.model && ` using ${file.summary.model}`}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Page Results - Only for content analysis */}
        {analysisType === 'content' && file.status === 'completed' && file.results && (
          <div className="space-y-3">
            <button
              onClick={() => setShowPages(!showPages)}
              className="flex items-center justify-between w-full"
            >
              <h4 className="font-medium text-gray-900">Page Analysis ({file.results.length})</h4>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                {showPages ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
            
            {showPages && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {file.results.slice(0, 10).map((result) => (
                  <div
                    key={result.pageNumber}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Page {result.pageNumber}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                        {result.error && (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
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
                    {result.processingTime && (
                      <div className="mt-2 text-xs text-gray-400">
                        {formatProcessingTime(result.processingTime)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {file.results.length > 10 && !showPages && (
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