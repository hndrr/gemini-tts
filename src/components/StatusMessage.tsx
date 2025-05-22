import React from 'react';

interface StatusMessageProps {
  type: 'error' | 'info' | 'success';
  message: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ type, message }) => {
  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
  };

  return (
    <div className={`p-3 rounded-md border ${styles[type]} my-4`}>
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default StatusMessage;