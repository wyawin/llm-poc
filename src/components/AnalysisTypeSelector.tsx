import React from 'react';
import { FileText, Shield, Eye, AlertTriangle } from 'lucide-react';
import { AnalysisType } from '../types';

interface AnalysisTypeSelectorProps {
  selectedType: AnalysisType;
  onTypeChange: (type: AnalysisType) => void;
  disabled?: boolean;
}

export const AnalysisTypeSelector: React.FC<AnalysisTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  disabled = false
}) => {
  const analysisTypes = [
    {
      type: 'content' as AnalysisType,
      label: 'Content Analysis',
      description: 'Extract and analyze document content, structure, and information',
      icon: FileText,
      color: 'blue',
      features: ['Text extraction', 'Content summarization', 'Structure analysis', 'Key insights']
    },
    {
      type: 'forgery' as AnalysisType,
      label: 'Forgery Detection',
      description: 'Detect document authenticity and potential tampering',
      icon: Shield,
      color: 'red',
      features: ['Font consistency', 'Spacing analysis', 'Digital manipulation', 'Authenticity scoring']
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Analysis Type</h3>
        <p className="text-gray-600">Select the type of analysis you want to perform on your documents</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analysisTypes.map((analysis) => {
          const isSelected = selectedType === analysis.type;
          const Icon = analysis.icon;
          
          return (
            <button
              key={analysis.type}
              onClick={() => !disabled && onTypeChange(analysis.type)}
              disabled={disabled}
              className={`
                relative p-6 rounded-xl border-2 text-left transition-all duration-300 transform
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
                ${isSelected 
                  ? `border-${analysis.color}-500 bg-${analysis.color}-50 shadow-lg` 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-start space-x-4">
                <div className={`
                  p-3 rounded-lg flex-shrink-0
                  ${isSelected 
                    ? `bg-${analysis.color}-100 text-${analysis.color}-600` 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {analysis.label}
                    </h4>
                    {isSelected && (
                      <div className={`
                        w-2 h-2 rounded-full bg-${analysis.color}-500 animate-pulse
                      `} />
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {analysis.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-900">Key Features:</h5>
                    <ul className="space-y-1">
                      {analysis.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className={`
                            w-1.5 h-1.5 rounded-full
                            ${isSelected ? `bg-${analysis.color}-500` : 'bg-gray-400'}
                          `} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {analysis.type === 'forgery' && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center space-x-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Advanced</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedType === 'forgery' && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800 mb-1">Forgery Detection Notice</h4>
              <p className="text-sm text-amber-700">
                This analysis uses advanced AI to detect potential document tampering and authenticity issues. 
                Results should be used as guidance and may require expert verification for legal purposes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};