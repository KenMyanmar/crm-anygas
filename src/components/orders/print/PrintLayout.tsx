
import React from 'react';

interface PrintLayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

const PrintLayout = ({ children, title, className = '' }: PrintLayoutProps) => {
  return (
    <div className={`print-document ${className}`}>
      <style>{`
        @media print {
          .print-document {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: black;
            background: white;
          }
          
          .print-header {
            border-bottom: 2px solid #000;
            margin-bottom: 20px;
            padding-bottom: 10px;
          }
          
          .print-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin: 10px 0;
          }
          
          .print-section {
            margin-bottom: 20px;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .print-table th,
          .print-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          
          .print-table th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          
          .print-signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }
          
          .print-signature {
            text-align: center;
            width: 200px;
          }
          
          .print-signature-line {
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
            height: 40px;
          }
          
          .no-print {
            display: none !important;
          }
          
          .page-break {
            page-break-before: always;
          }
        }
        
        @media screen {
          .print-document {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
          }
        }
      `}</style>
      <div className="print-header">
        <h1 className="print-title">{title}</h1>
      </div>
      {children}
    </div>
  );
};

export default PrintLayout;
