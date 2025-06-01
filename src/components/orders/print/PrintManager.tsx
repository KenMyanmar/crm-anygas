
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Download, FileText, Receipt, FileSpreadsheet } from 'lucide-react';
import { DeliveredOrder } from '@/hooks/useDeliveredOrders';
import DeliveryOrderPrint from './DeliveryOrderPrint';
import ReceiptPrint from './ReceiptPrint';
import InvoicePrint from './InvoicePrint';

interface PrintManagerProps {
  order: DeliveredOrder;
  variant?: 'button' | 'icon';
  size?: 'sm' | 'default' | 'lg';
}

const PrintManager = ({ order, variant = 'button', size = 'sm' }: PrintManagerProps) => {
  const [selectedDocument, setSelectedDocument] = useState<string>('delivery-order');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const documentTypes = [
    { value: 'delivery-order', label: 'Delivery Order', icon: FileText },
    { value: 'receipt', label: 'Receipt', icon: Receipt },
    { value: 'invoice', label: 'Invoice', icon: FileSpreadsheet },
  ];

  const renderDocument = () => {
    switch (selectedDocument) {
      case 'delivery-order':
        return <DeliveryOrderPrint order={order} />;
      case 'receipt':
        return <ReceiptPrint order={order} />;
      case 'invoice':
        return <InvoicePrint order={order} />;
      default:
        return <DeliveryOrderPrint order={order} />;
    }
  };

  const handlePrint = () => {
    setIsPreviewOpen(true);
    // Small delay to ensure the content is rendered
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleDownload = () => {
    // Create a new window for printing/downloading
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${selectedDocument.replace('-', ' ').toUpperCase()} - ${order.order_number}</title>
            <style>
              body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            ${document.querySelector('.print-document')?.outerHTML || ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const ButtonContent = variant === 'icon' ? (
    <Printer className="h-4 w-4" />
  ) : (
    <>
      <Printer className="h-4 w-4 mr-2" />
      Print/Download
    </>
  );

  return (
    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size={size}>
          {ButtonContent}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Print/Download Documents</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={selectedDocument} onValueChange={setSelectedDocument}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 max-h-[60vh] overflow-y-auto">
            {renderDocument()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintManager;
