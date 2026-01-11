import { CartItem } from '@/data/mockData';
import { forwardRef } from 'react';

interface PrintReceiptProps {
  items: CartItem[];
  tokenNumber: number;
  total: number;
  paymentMode?: 'CASH' | 'UPI';
}

const PrintReceipt = forwardRef<HTMLDivElement, PrintReceiptProps>(
  ({ items, tokenNumber, total, paymentMode = 'CASH' }, ref) => {
    const now = new Date();
    const date = now.toLocaleDateString('en-IN');
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
      <div 
        ref={ref} 
        className="print-receipt"
        style={{
          display: 'none',
          width: '58mm',
          maxWidth: '58mm',
          padding: '2mm',
          fontFamily: "'Courier New', monospace",
          fontSize: '12px',
          lineHeight: 1.3,
          color: '#000',
          background: '#fff',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>GODAVARI CAFE</div>
          <div style={{ fontSize: '10px', marginTop: '1mm' }}>{date} | {time}</div>
        </div>

        {/* Divider */}
        <div style={{ textAlign: 'center', margin: '2mm 0', fontSize: '10px' }}>----------------------</div>

        {/* MASSIVE Token Number - Kitchen Friendly */}
        <div style={{ textAlign: 'center', margin: '4mm 0' }}>
          <div style={{ fontSize: '10px', fontWeight: 500, marginBottom: '1mm' }}>TOKEN</div>
          <div style={{ 
            fontSize: '60px', 
            fontWeight: 900, 
            lineHeight: 1,
            letterSpacing: '-2px',
          }}>
            #{tokenNumber}
          </div>
        </div>

        {/* Divider */}
        <div style={{ textAlign: 'center', margin: '2mm 0', fontSize: '10px' }}>----------------------</div>

        {/* Items */}
        <div style={{ margin: '2mm 0' }}>
          {items.map((item) => (
            <div 
              key={item.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '1.5mm',
                fontSize: '12px',
                width: '100%',
                boxSizing: 'border-box',
                gap: '2mm',
              }}
            >
              <span style={{ 
                flex: 1, 
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                fontWeight: 500,
                minWidth: 0,
              }}>
                {item.name}
              </span>
              <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>x{item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ textAlign: 'center', margin: '2mm 0', fontSize: '10px' }}>----------------------</div>

        {/* Total */}
        <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', margin: '2mm 0' }}>
          Total: ₹{total}
        </div>

        {/* Payment Mode */}
        <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 500, margin: '1mm 0' }}>
          Payment: <strong>{paymentMode}</strong>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '3mm' }}>
          Thank You! Visit Again.
        </div>
      </div>
    );
  }
);

PrintReceipt.displayName = 'PrintReceipt';

export default PrintReceipt;
