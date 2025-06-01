import React from 'react';
import PrintLayout from './PrintLayout';
import { DeliveredOrder } from '@/hooks/useDeliveredOrders';
import { formatDate } from '@/lib/supabase';

interface InvoicePrintProps {
  order: DeliveredOrder;
}

const InvoicePrint = ({ order }: InvoicePrintProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const calculateTax = (amount: number) => {
    // Assuming 5% tax rate - adjust as needed
    return amount * 0.05;
  };

  const subtotal = order.total_amount_kyats;
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  return (
    <PrintLayout title="INVOICE" className="invoice">
      <style>{`
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          border-bottom: 3px solid #333;
          padding-bottom: 20px;
        }
        
        .invoice-company {
          flex: 1;
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }
        
        .invoice-logo {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        
        .invoice-company-text {
          flex: 1;
        }
        
        .invoice-company-name {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        
        .invoice-company-details {
          font-size: 12px;
          line-height: 1.4;
          color: #666;
        }
        
        .invoice-number-section {
          text-align: right;
        }
        
        .invoice-number {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }
        
        .invoice-dates {
          font-size: 12px;
        }
        
        .invoice-parties {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        
        .bill-to,
        .ship-to {
          flex: 1;
          margin-right: 20px;
        }
        
        .party-title {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
          color: #333;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        
        .party-details {
          font-size: 12px;
          line-height: 1.5;
        }
        
        .invoice-table {
          margin-bottom: 20px;
        }
        
        .invoice-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          text-align: center;
        }
        
        .invoice-table td {
          text-align: center;
        }
        
        .invoice-table td:first-child {
          text-align: left;
        }
        
        .invoice-totals {
          width: 300px;
          margin-left: auto;
          margin-bottom: 30px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }
        
        .total-row.final {
          font-weight: bold;
          font-size: 16px;
          border-bottom: 3px double #333;
          border-top: 2px solid #333;
          padding: 10px 0;
        }
        
        .invoice-terms {
          font-size: 11px;
          margin-top: 30px;
          border-top: 1px solid #ccc;
          padding-top: 15px;
        }
        
        .terms-title {
          font-weight: bold;
          margin-bottom: 10px;
        }
      `}</style>

      <div className="invoice-header">
        <div className="invoice-company">
          <img src="/anygas-logo.png" alt="ANY GAS Logo" className="invoice-logo" />
          <div className="invoice-company-text">
            <div className="invoice-company-name">ANY GAS</div>
            <div className="invoice-company-details">
              Your Trusted Gas Partner<br/>
              84 Baho Road, Ward 3, South Okkalapa, Yangon Myanmar<br/>
              Hotline: 8484 | Email: sales@anygas.org<br/>
              Tax ID: [Tax Number]
            </div>
          </div>
        </div>
        <div className="invoice-number-section">
          <div className="invoice-number">INV-{order.order_number}</div>
          <div className="invoice-dates">
            <div><strong>Invoice Date:</strong> {formatDate(order.order_date)}</div>
            <div><strong>Due Date:</strong> {formatDate(order.delivery_date_scheduled)}</div>
          </div>
        </div>
      </div>

      <div className="invoice-parties">
        <div className="bill-to">
          <div className="party-title">BILL TO</div>
          <div className="party-details">
            <strong>{order.restaurant.name}</strong><br/>
            Contact: {order.restaurant.contact_person || 'N/A'}<br/>
            Township: {order.restaurant.township || 'N/A'}<br/>
            Phone: {order.restaurant.phone || 'N/A'}
          </div>
        </div>
        
        <div className="ship-to">
          <div className="party-title">SHIP TO</div>
          <div className="party-details">
            <strong>{order.restaurant.name}</strong><br/>
            Contact: {order.restaurant.contact_person || 'N/A'}<br/>
            Township: {order.restaurant.township || 'N/A'}<br/>
            Delivered: {formatDate(order.delivery_date_actual)}
          </div>
        </div>
      </div>

      <table className="print-table invoice-table">
        <thead>
          <tr>
            <th style={{ width: '40%' }}>DESCRIPTION</th>
            <th style={{ width: '15%' }}>QTY</th>
            <th style={{ width: '20%' }}>UNIT PRICE</th>
            <th style={{ width: '25%' }}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((item, index) => (
            <tr key={index}>
              <td>{item.product_name}</td>
              <td>{item.quantity}</td>
              <td>{formatCurrency(item.unit_price_kyats)} Kyats</td>
              <td>{formatCurrency(item.sub_total_kyats)} Kyats</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-totals">
        <div className="total-row">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)} Kyats</span>
        </div>
        <div className="total-row">
          <span>Tax (5%):</span>
          <span>{formatCurrency(tax)} Kyats</span>
        </div>
        <div className="total-row final">
          <span>TOTAL:</span>
          <span>{formatCurrency(total)} Kyats</span>
        </div>
      </div>

      {order.notes && (
        <div className="print-section">
          <div className="section-title">NOTES</div>
          <div style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#f9f9f9' }}>
            {order.notes}
          </div>
        </div>
      )}

      <div className="invoice-terms">
        <div className="terms-title">TERMS & CONDITIONS</div>
        <div>
          1. Payment is due within 30 days of invoice date.<br/>
          2. Late payments may incur additional charges.<br/>
          3. All prices are in Myanmar Kyats.<br/>
          4. Goods remain the property of ANY GAS until payment is received in full.
        </div>
      </div>
    </PrintLayout>
  );
};

export default InvoicePrint;
