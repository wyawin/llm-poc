import React from 'react';
import { UploadedFile } from '../types';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface StatsProps {
  files: UploadedFile[];
}

export const Stats: React.FC<StatsProps> = ({ files }) => {
  const stats = {
    total: files.length,
    completed: files.filter(f => f.status === 'completed').length,
    processing: files.filter(f => f.status === 'processing' || f.status === 'uploading').length,
    errors: files.filter(f => f.status === 'error').length,
    totalPages: files.reduce((sum, f) => sum + (f.results?.length || 0), 0),
  };

  const statItems = [
    {
      label: 'Total Documents',
      value: stats.total,
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Processing',
      value: stats.processing,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      label: 'Errors',
      value: stats.errors,
      icon: AlertCircle,
      color: 'text-red-600 bg-red-50',
    },
  ];

  if (files.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-sm text-gray-600">{item.label}</p>
            </div>
          </div>
        </div>
      ))}
      
      {stats.totalPages > 0 && (
        <div className="col-span-2 md:col-span-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200 p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{stats.totalPages}</p>
            <p className="text-sm text-gray-600">Total pages processed</p>
          </div>
        </div>
      )}
    </div>
  );
};