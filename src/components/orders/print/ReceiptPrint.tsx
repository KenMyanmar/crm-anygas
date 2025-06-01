import React from 'react';
import PrintLayout from './PrintLayout';
import { DeliveredOrder } from '@/hooks/useDeliveredOrders';
import { formatDate } from '@/lib/supabase';

interface ReceiptPrintProps {
  order: DeliveredOrder;
}

const ReceiptPrint = ({ order }: ReceiptPrintProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  return (
    <PrintLayout title="PAYMENT RECEIPT" className="receipt">
      <style>{`
        .receipt {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border: 2px solid #1976d2;
        }
        
        .receipt-header {
          text-align: center;
          background: #1976d2;
          color: white;
          padding: 15px;
          margin: -20px -20px 20px -20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }
        
        .receipt-logo {
          width: 50px;
          height: 50px;
          object-fit: contain;
          background: white;
          border-radius: 50%;
          padding: 5px;
        }
        
        .receipt-header-text {
          text-align: center;
        }
        
        .receipt-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .receipt-subtitle {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .receipt-number {
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 20px;
          background: white;
          padding: 10px;
          border: 2px solid #1976d2;
        }
        
        .receipt-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .receipt-left,
        .receipt-right {
          flex: 1;
        }
        
        .receipt-field {
          display: flex;
          margin-bottom: 8px;
          font-size: 12px;
        }
        
        .receipt-label {
          font-weight: bold;
          width: 100px;
          color: #1976d2;
        }
        
        .receipt-table {
          background: white;
          border: 2px solid #1976d2;
          margin-bottom: 20px;
        }
        
        .receipt-table th {
          background: #1976d2;
          color: white;
          font-weight: bold;
        }
        
        .receipt-total {
          text-align: right;
          font-size: 16px;
          font-weight: bold;
          background: #1976d2;
          color: white;
          padding: 10px;
          margin-top: 20px;
        }
        
        .receipt-footer {
          text-align: center;
          margin-top: 30px;
          font-size: 11px;
          font-style: italic;
        }
        
        .receipt-company-info {
          text-align: center;
          font-size: 10px;
          margin-top: 15px;
          padding: 10px;
          background: rgba(255,255,255,0.8);
          border-radius: 5px;
        }
      `}</style>

      <div className="receipt-header">
        <img src="/anygas-logo.png" alt="ANY GAS Logo" className="receipt-logo" />
        <div className="receipt-header-text">
          <div className="receipt-title">ANY GAS</div>
          <div className="receipt-subtitle">Payment Receipt</div>
        </div>
      </div>

      <div className="receipt-number">
        Receipt No: R-{order.order_number}
      </div>

      <div className="receipt-details">
        <div className="receipt-left">
          <div className="receipt-field">
            <span className="receipt-label">Customer:</span>
            <span>{order.restaurant.name}</span>
          </div>
          <div className="receipt-field">
            <span className="receipt-label">Contact:</span>
            <span>{order.restaurant.contact_person || 'N/A'}</span>
          </div>
          <div className="receipt-field">
            <span className="receipt-label">Township:</span>
            <span>{order.restaurant.township || 'N/A'}</span>
          </div>
        </div>
        
        <div className="receipt-right">
          <div className="receipt-field">
            <span className="receipt-label">Date:</span>
            <span>{formatDate(order.delivery_date_actual)}</span>
          </div>
          <div className="receipt-field">
            <span className="receipt-label">Order No:</span>
            <span>{order.order_number}</span>
          </div>
          <div className="receipt-field">
            <span className="receipt-label">Cashier:</span>
            <span>{order.created_by_user?.full_name || 'N/A'}</span>
          </div>
        </div>
      </div>

      <table className="print-table receipt-table">
        <thead>
          <tr>
            <th>DESCRIPTION</th>
            <th>QTY</th>
            <th>RATE</th>
            <th>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((item, index) => (
            <tr key={index}>
              <td>{item.product_name}</td>
              <td>{item.quantity}</td>
              <td>{formatCurrency(item.unit_price_kyats)}</td>
              <td>{formatCurrency(item.sub_total_kyats)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="receipt-total">
        TOTAL AMOUNT: {formatCurrency(order.total_amount_kyats)} KYATS
      </div>

      <div className="receipt-company-info">
        84 Baho Road, Ward 3, South Okkalapa, Yangon Myanmar<br/>
        Hotline: 8484 | Email: sales@anygas.org
      </div>

      <div className="receipt-footer">
        <div>Thank you for your business!</div>
        <div>This is a computer generated receipt.</div>
        <div>For any queries, please contact our customer service.</div>
      </div>
    </PrintLayout>
  );
};

export default ReceiptPrint;
