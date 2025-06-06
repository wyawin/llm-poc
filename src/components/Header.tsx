import React from 'react';
import { Brain, FileText } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-3 py-2 rounded-lg">
              <Brain className="h-6 w-6" />
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Ollama Document Processor</h1>
              <p className="text-sm text-gray-600">AI-powered document analysis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Service Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};