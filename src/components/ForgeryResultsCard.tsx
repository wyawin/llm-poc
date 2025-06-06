import React, { useState } from 'react';
import { ForgeryAnalysisResult } from '../types';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, ChevronDown, ChevronUp, Type, Space as Spacing, Image as ImageIcon, Layout, TrendingUp, Clock } from 'lucide-react';

interface ForgeryResultsCardProps {
  results: ForgeryAnalysisResult[];
  fileName: string;
}

export const ForgeryResultsCard: React.FC<ForgeryResultsCardProps> = ({ results, fileName }) => {
  const [expandedPage, setExpandedPage] = useState<number | null>(null);
  const [selectedPage, setSelectedPage] = useState<ForgeryAnalysisResult | null>(null);

  const averageRiskScore = results.reduce((sum, r) => sum + r.overallRiskScore, 0) / results.length;
  const highRiskPages = results.filter(r => r.overallRiskScore > 70).length;
  const mediumRiskPages = results.filter(r => r.overallRiskScore > 40 && r.overallRiskScore <= 70).length;
  const lowRiskPages = results.filter(r => r.overallRiskScore <= 40).length;

  const getRiskLevel = (score: number) => {
    if (score > 70) return { level: 'High', color: 'red', icon: XCircle };
    if (score > 40) return { level: 'Medium', color: 'yellow', icon: AlertTriangle };
    return { level: 'Low', color: 'green', icon: CheckCircle };
  };

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Forgery Detection Results</h3>
            <p className="text-gray-600">{fileName}</p>
          </div>
        </div>

        {/* Overall Risk Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                averageRiskScore > 70 ? 'text-red-600' : 
                averageRiskScore > 40 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {averageRiskScore.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Average Risk Score</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{highRiskPages}</div>
              <p className="text-sm text-gray-600">High Risk Pages</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{mediumRiskPages}</div>
              <p className="text-sm text-gray-600">Medium Risk Pages</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{lowRiskPages}</div>
              <p className="text-sm text-gray-600">Low Risk Pages</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Page-by-Page Analysis</h4>
        
        <div className="space-y-4">
          {results.map((result) => {
            const risk = getRiskLevel(result.overallRiskScore);
            const RiskIcon = risk.icon;
            const isExpanded = expandedPage === result.pageNumber;
            
            return (
              <div key={result.pageNumber} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedPage(isExpanded ? null : result.pageNumber)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <RiskIcon className={`h-5 w-5 text-${risk.color}-600`} />
                    <span className="font-medium text-gray-900">Page {result.pageNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${risk.color}-100 text-${risk.color}-800`}>
                      {risk.level} Risk ({result.overallRiskScore.toFixed(1)}%)
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                
                {isExpanded && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Analysis Categories */}
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Type className="h-4 w-4 text-blue-600" />
                            <h5 className="font-medium text-blue-900">Font Analysis</h5>
                          </div>
                          <div className="text-sm text-blue-800 space-y-1">
                            <p>Consistency: {(result.forgeryAnalysis.fontAnalysis.fontConsistency * 100).toFixed(1)}%</p>
                            <p>Font Mixing: {result.forgeryAnalysis.fontAnalysis.fontMixingDetected ? 'Detected' : 'None'}</p>
                            {result.forgeryAnalysis.fontAnalysis.suspiciousCharacters.length > 0 && (
                              <p>Suspicious Characters: {result.forgeryAnalysis.fontAnalysis.suspiciousCharacters.join(', ')}</p>
                            )}
                          </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Spacing className="h-4 w-4 text-green-600" />
                            <h5 className="font-medium text-green-900">Spacing Analysis</h5>
                          </div>
                          <div className="text-sm text-green-800 space-y-1">
                            <p>Letter Spacing: {result.forgeryAnalysis.spacingAnalysis.letterSpacing.toFixed(2)}</p>
                            <p>Word Spacing: {result.forgeryAnalysis.spacingAnalysis.wordSpacing.toFixed(2)}</p>
                            <p>Line Spacing: {result.forgeryAnalysis.spacingAnalysis.lineSpacing.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <ImageIcon className="h-4 w-4 text-purple-600" />
                            <h5 className="font-medium text-purple-900">Image Quality</h5>
                          </div>
                          <div className="text-sm text-purple-800 space-y-1">
                            <p>Resolution: {result.forgeryAnalysis.imageQualityAnalysis.resolution}</p>
                            <p>Compression Artifacts: {result.forgeryAnalysis.imageQualityAnalysis.compressionArtifacts ? 'Present' : 'None'}</p>
                            <p>Pixelation Issues: {result.forgeryAnalysis.imageQualityAnalysis.pixelationIssues ? 'Detected' : 'None'}</p>
                          </div>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Layout className="h-4 w-4 text-orange-600" />
                            <h5 className="font-medium text-orange-900">Structural Analysis</h5>
                          </div>
                          <div className="text-sm text-orange-800 space-y-1">
                            <p>Margin Issues: {result.forgeryAnalysis.structuralAnalysis.marginInconsistencies ? 'Detected' : 'None'}</p>
                            <p>Layout Anomalies: {result.forgeryAnalysis.structuralAnalysis.layoutAnomalies.length}</p>
                            <p>Watermark: {result.forgeryAnalysis.structuralAnalysis.watermarkAnalysis}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    {result.forgeryAnalysis.riskFactors.length > 0 && (
                      <div className="mt-4 p-4 bg-red-50 rounded-lg">
                        <h5 className="font-medium text-red-900 mb-2 flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Risk Factors Detected</span>
                        </h5>
                        <ul className="text-sm text-red-800 space-y-1">
                          {result.forgeryAnalysis.riskFactors.map((factor, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Overall Assessment */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Overall Assessment</h5>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {result.forgeryAnalysis.overallAssessment}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>Authenticity Score: {(result.forgeryAnalysis.authenticityScore * 100).toFixed(1)}%</span>
                        <span>Processing Time: {formatProcessingTime(result.processingTime)}</span>
                      </div>
                    </div>

                    {/* View Image Button */}
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => setSelectedPage(result)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Page Image</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Modal */}
      {selectedPage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Page {selectedPage.pageNumber} - Forgery Analysis</h3>
              <button
                onClick={() => setSelectedPage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedPage.imageUrl}
                alt={`Page ${selectedPage.pageNumber}`}
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};