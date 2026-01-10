import { CartItem } from '@/data/mockData';
import { forwardRef } from 'react';

interface PrintReceiptProps {
  items: CartItem[];
  tokenNumber: number;
  total: number;
}

const PrintReceipt = forwardRef<HTMLDivElement, PrintReceiptProps>(
  ({ items, tokenNumber, total }, ref) => {
    const now = new Date();
    const date = now.toLocaleDateString('en-IN');
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
      <div 
        ref={ref} 
        className="print-receipt"
        style={{
          display: 'none',
          width: '72mm',
          padding: '4mm',
          fontFamily: "'Courier New', monospace",
          fontSize: '12pt',
          lineHeight: 1.4,
          color: '#000',
          background: '#fff',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3mm' }}>
          <div style={{ fontSize: '16pt', fontWeight: 'bold' }}>GODAVARI CAFE</div>
          <div style={{ fontSize: '10pt', marginTop: '1mm' }}>{date} | {time}</div>
        </div>

        {/* Divider */}
        <div style={{ textAlign: 'center', margin: '3mm 0', fontSize: '10pt' }}>------------------------</div>

        {/* Token Number */}
        <div style={{ textAlign: 'center', margin: '4mm 0' }}>
          <div style={{ fontSize: '12pt', fontWeight: 500 }}>TOKEN</div>
          <div style={{ fontSize: '32pt', fontWeight: 900 }}>#{tokenNumber}</div>
        </div>

        {/* Divider */}
        <div style={{ textAlign: 'center', margin: '3mm 0', fontSize: '10pt' }}>------------------------</div>

        {/* Items */}
        <div style={{ margin: '3mm 0' }}>
          {items.map((item) => (
            <div 
              key={item.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '2mm',
                fontSize: '12pt',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <span style={{ flex: 1, wordWrap: 'break-word', paddingRight: '3mm', fontWeight: 500 }}>
                {item.name}
              </span>
              <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>x{item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ textAlign: 'center', margin: '3mm 0', fontSize: '10pt' }}>------------------------</div>

        {/* Total */}
        <div style={{ textAlign: 'center', fontSize: '14pt', fontWeight: 'bold', margin: '3mm 0' }}>
          Total: ₹{total}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '10pt', marginTop: '4mm' }}>
          Thank You! Visit Again.
        </div>
      </div>
    );
  }
);

PrintReceipt.displayName = 'PrintReceipt';

export default PrintReceipt;
