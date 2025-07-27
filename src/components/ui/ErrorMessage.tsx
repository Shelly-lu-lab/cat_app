import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
  error: string;
  onClose?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onClose }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <XMarkIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-800">{error}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto flex-shrink-0"
          >
            <XMarkIcon className="h-5 w-5 text-red-400 hover:text-red-600" />
          </button>
        )}
      </div>
    </div>
  );
}; 