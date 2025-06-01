
import React, { useState, useEffect } from 'react';
import PrintLayout from './PrintLayout';
import { DeliveredOrder } from '@/hooks/useDeliveredOrders';
import { formatDate } from '@/lib/supabase';
import { getCompanyLogoUrl, getCompanyLogoUrlSync } from '@/utils/logoUpload';

interface DeliveryOrderPrintProps {
  order: DeliveredOrder;
}

const DeliveryOrderPrint = ({ order }: DeliveryOrderPrintProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const url = await getCompanyLogoUrl();
        if (url) {
          setLogoUrl(url);
        } else {
          setLogoUrl(getCompanyLogoUrlSync());
        }
      } catch (error) {
        console.error('Error loading logo:', error);
        setLogoUrl(getCompanyLogoUrlSync());
      }
    };

    loadLogo();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' Kyats';
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  return (
    <PrintLayout title="DELIVERY ORDER" className="delivery-order">
      <style>{`
        .delivery-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        
        .company-info {
          flex: 1;
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }
        
        .company-logo {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        
        .company-logo-fallback {
          width: 60px;
          height: 60px;
          border: 2px solid #1e40af;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #1e40af;
          font-size: 12px;
          text-align: center;
          border-radius: 8px;
        }
        
        .company-details-text {
          flex: 1;
        }
        
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        
        .company-tagline {
          font-style: italic;
          color: #666;
          margin-bottom: 10px;
        }
        
        .company-details {
          font-size: 11px;
          line-height: 1.3;
        }
        
        .do-number {
          text-align: right;
          font-size: 14px;
          font-weight: bold;
        }
        
        .customer-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .customer-info,
        .delivery-info {
          flex: 1;
          margin-right: 20px;
        }
        
        .section-title {
          font-weight: bold;
          margin-bottom: 10px;
          text-decoration: underline;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 5px;
        }
        
        .info-label {
          font-weight: bold;
          width: 120px;
        }
        
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
        }
        
        .signature-box {
          text-align: center;
          width: 200px;
        }
        
        .signature-line {
          border-bottom: 1px solid #000;
          height: 40px;
          margin-bottom: 5px;
        }
      `}</style>

      <div className="delivery-header">
        <div className="company-info">
          {logoUrl && !logoError ? (
            <img 
              src={logoUrl} 
              alt="ANY GAS Logo" 
              className="company-logo"
              onError={handleLogoError}
            />
          ) : (
            <div className="company-logo-fallback">
              ANY GAS
            </div>
          )}
          <div className="company-details-text">
            <div className="company-name">ANY GAS</div>
            <div className="company-tagline">Your Trusted Gas Partner</div>
            <div className="company-details">
              Address: 84 Baho Road, Ward 3, South Okkalapa, Yangon Myanmar<br/>
              Hotline: 8484<br/>
              Email: sales@anygas.org
            </div>
          </div>
        </div>
        <div className="do-number">
          <div>D.O. NO: {order.order_number}</div>
          <div>Date: {formatDate(order.order_date)}</div>
        </div>
      </div>

      <div className="customer-section">
        <div className="customer-info">
          <div className="section-title">CUSTOMER INFORMATION</div>
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span>{order.restaurant.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Contact Person:</span>
            <span>{order.restaurant.contact_person || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Phone:</span>
            <span>{order.restaurant.phone || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Township:</span>
            <span>{order.restaurant.township || 'N/A'}</span>
          </div>
        </div>
        
        <div className="delivery-info">
          <div className="section-title">DELIVERY INFORMATION</div>
          <div className="info-row">
            <span className="info-label">Scheduled:</span>
            <span>{formatDate(order.delivery_date_scheduled)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Delivered:</span>
            <span>{formatDate(order.delivery_date_actual)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Created By:</span>
            <span>{order.created_by_user?.full_name || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="print-section">
        <table className="print-table">
          <thead>
            <tr>
              <th>SL</th>
              <th>DESCRIPTION</th>
              <th>QTY</th>
              <th>UNIT PRICE</th>
              <th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.product_name}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unit_price_kyats)}</td>
                <td>{formatCurrency(item.sub_total_kyats)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={4} style={{ fontWeight: 'bold', textAlign: 'right' }}>TOTAL:</td>
              <td style={{ fontWeight: 'bold' }}>{formatCurrency(order.total_amount_kyats)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {order.notes && (
        <div className="print-section">
          <div className="section-title">REMARKS</div>
          <div style={{ border: '1px solid #000', padding: '10px', minHeight: '50px' }}>
            {order.notes}
          </div>
        </div>
      )}

      <div className="signature-section">
        <div className="signature-box">
          <div className="signature-line"></div>
          <div>PREPARED BY</div>
          <div>{order.created_by_user?.full_name || ''}</div>
        </div>
        <div className="signature-box">
          <div className="signature-line"></div>
          <div>RECEIVED BY</div>
          <div>Customer Signature</div>
        </div>
        <div className="signature-box">
          <div className="signature-line"></div>
          <div>DELIVERED BY</div>
          <div>Delivery Person</div>
        </div>
      </div>
    </PrintLayout>
  );
};

export default DeliveryOrderPrint;
