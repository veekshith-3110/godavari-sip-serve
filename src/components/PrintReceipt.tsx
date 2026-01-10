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
      <div ref={ref} className="print-receipt hidden print:block p-2 font-mono text-xs">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-lg font-bold">GODAVARI CAFE</h1>
          <p className="text-[10px] mt-1">{date} | {time}</p>
        </div>

        {/* Divider */}
        <p className="text-center my-2">--------------------------------</p>

        {/* Token Number */}
        <div className="text-center my-4">
          <p className="text-xs">TOKEN</p>
          <p className="text-4xl font-extrabold">#{tokenNumber}</p>
        </div>

        {/* Divider */}
        <p className="text-center my-2">--------------------------------</p>

        {/* Items */}
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="truncate flex-1">{item.name}</span>
              <span className="ml-2">x{item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <p className="text-center my-2">--------------------------------</p>

        {/* Total */}
        <div className="text-center font-bold text-sm">
          Total: ₹{total}
        </div>

        {/* Footer */}
        <p className="text-center mt-4 text-[10px]">Thank You! Visit Again.</p>
      </div>
    );
  }
);

PrintReceipt.displayName = 'PrintReceipt';

export default PrintReceipt;
