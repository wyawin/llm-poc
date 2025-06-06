import React from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ProcessingCard } from './components/ProcessingCard';
import { Stats } from './components/Stats';
import { AnalysisTypeSelector } from './components/AnalysisTypeSelector';
import { useFileUpload } from './hooks/useFileUpload';
import { Trash2, RefreshCw, FileText } from 'lucide-react';

function App() {
  const { files, isUploading, analysisType, setAnalysisType, uploadFile, removeFile, clearAll } = useFileUpload();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Transform Your Documents with AI
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload PDF documents and choose between content analysis for insights extraction 
            or forgery detection for document authenticity verification.
          </p>
        </div>

        <div className="space-y-8">
          <AnalysisTypeSelector 
            selectedType={analysisType}
            onTypeChange={setAnalysisType}
            disabled={isUploading}
          />
          
          <FileUpload onFileUpload={uploadFile} isUploading={isUploading} />
          
          <Stats files={files} />
          
          {files.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Processing Queue ({files.length})
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={clearAll}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {files.map((file) => (
                  <ProcessingCard
                    key={file.id}
                    file={file}
                    onRemove={removeFile}
                    analysisType={analysisType}
                  />
                ))}
              </div>
            </div>
          )}
          
          {files.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No documents uploaded yet
                </h3>
                <p className="text-gray-500">
                  Upload your first PDF document to get started with AI-powered analysis.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>Powered by Ollama AI • Secure document processing • Enterprise-ready</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;