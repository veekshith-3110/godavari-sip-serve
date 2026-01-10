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
      <div ref={ref} className="print-receipt hidden">
        {/* Header */}
        <div className="receipt-header">
          <div className="receipt-title">GODAVARI CAFE</div>
          <div className="receipt-date">{date} | {time}</div>
        </div>

        {/* Divider */}
        <div className="receipt-divider">------------------------</div>

        {/* Token Number */}
        <div className="receipt-token">
          <div className="receipt-token-label">TOKEN</div>
          <div className="receipt-token-number">#{tokenNumber}</div>
        </div>

        {/* Divider */}
        <div className="receipt-divider">------------------------</div>

        {/* Items */}
        <div className="receipt-items">
          {items.map((item) => (
            <div key={item.id} className="receipt-item">
              <span className="receipt-item-name">{item.name}</span>
              <span className="receipt-item-qty">x{item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="receipt-divider">------------------------</div>

        {/* Total */}
        <div className="receipt-total">Total: ₹{total}</div>

        {/* Footer */}
        <div className="receipt-footer">Thank You! Visit Again.</div>
      </div>
    );
  }
);

PrintReceipt.displayName = 'PrintReceipt';

export default PrintReceipt;
