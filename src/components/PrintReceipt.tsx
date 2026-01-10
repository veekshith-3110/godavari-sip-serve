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
      <div ref={ref} className="print-receipt hidden print:block p-4 font-mono text-sm w-[280px] mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-bold">GODAVARI CAFE</h1>
          <p className="text-xs mt-1">{date} | {time}</p>
        </div>

        {/* Divider */}
        <p className="text-center my-3">------------------------</p>

        {/* Token Number */}
        <div className="text-center my-4">
          <p className="text-sm font-medium">TOKEN</p>
          <p className="text-5xl font-extrabold">#{tokenNumber}</p>
        </div>

        {/* Divider */}
        <p className="text-center my-3">------------------------</p>

        {/* Items */}
        <div className="space-y-2 px-1">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center gap-2">
              <span className="text-base font-medium break-words flex-1 leading-tight">{item.name}</span>
              <span className="text-base font-bold whitespace-nowrap">x{item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <p className="text-center my-3">------------------------</p>

        {/* Total */}
        <div className="text-center font-bold text-lg">
          Total: ₹{total}
        </div>

        {/* Footer */}
        <p className="text-center mt-4 text-xs">Thank You! Visit Again.</p>
      </div>
    );
  }
);

PrintReceipt.displayName = 'PrintReceipt';

export default PrintReceipt;
