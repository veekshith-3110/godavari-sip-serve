import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PrinterDevice {
  name: string;
  address: string;
}

interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

interface PrinterError {
  code: string;
  message: string;
}

// Check if we're in a Capacitor native environment
const isCapacitor = () => {
  return typeof (window as any).Capacitor !== 'undefined' && 
         (window as any).Capacitor.isNativePlatform?.();
};

// Dynamically import the thermal printer plugin
const getThermalPrinter = async () => {
  if (!isCapacitor()) return null;
  try {
    const { CapacitorThermalPrinter } = await import('capacitor-thermal-printer');
    return CapacitorThermalPrinter;
  } catch {
    return null;
  }
};

export const usePrinter = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterDevice | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState<PrinterDevice[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printerError, setPrinterError] = useState<PrinterError | null>(null);
  const { toast } = useToast();

  const isNative = isCapacitor();

  // Set up event listeners for device discovery
  useEffect(() => {
    if (!isNative) return;

    let listenerHandle: any = null;
    let finishHandle: any = null;

    const setupListeners = async () => {
      const printer = await getThermalPrinter();
      if (!printer) return;

      // Listen for discovered devices
      listenerHandle = await printer.addListener('discoverDevices', (data: { devices: PrinterDevice[] }) => {
        setAvailablePrinters(data.devices);
      });

      // Listen for scan finish
      finishHandle = await printer.addListener('discoveryFinish', () => {
        setIsScanning(false);
      });
    };

    setupListeners();

    return () => {
      listenerHandle?.remove?.();
      finishHandle?.remove?.();
    };
  }, [isNative]);

  // Check Bluetooth permission status
  const checkBluetoothPermission = useCallback(async (): Promise<boolean> => {
    if (!isNative) return true;

    try {
      const thermalPrinter = await getThermalPrinter();
      if (!thermalPrinter) return false;

      // Most plugins have a permission check method
      // If not, we'll catch the error during scan
      return true;
    } catch {
      return false;
    }
  }, [isNative]);

  // Ping printer to check if it's still connected
  const pingPrinter = useCallback(async (): Promise<boolean> => {
    if (!isNative || !selectedPrinter) return false;

    try {
      const thermalPrinter = await getThermalPrinter();
      if (!thermalPrinter) return false;

      const connected = await thermalPrinter.isConnected();
      setIsConnected(connected);
      return connected;
    } catch {
      setIsConnected(false);
      return false;
    }
  }, [isNative, selectedPrinter]);

  const scanForPrinters = useCallback(async () => {
    if (!isNative) {
      toast({
        title: "Native App Required",
        description: "Bluetooth printing requires the native mobile app. Use browser print for now.",
        variant: "destructive"
      });
      return [];
    }

    // Check permissions first
    const hasPermission = await checkBluetoothPermission();
    if (!hasPermission) {
      setPrinterError({
        code: 'PERMISSION_DENIED',
        message: 'Bluetooth permission required',
      });
      toast({
        title: "Permission Required",
        description: "Please enable Bluetooth permission in Settings",
        variant: "destructive"
      });
      return [];
    }

    setIsScanning(true);
    setAvailablePrinters([]);
    setPrinterError(null);
    
    try {
      const printer = await getThermalPrinter();
      if (!printer) {
        throw new Error('Printer plugin not available');
      }

      toast({
        title: "Scanning...",
        description: "Looking for Bluetooth printers nearby"
      });

      // Start scanning - results come via event listener
      await printer.startScan();

      return [];
    } catch (error: any) {
      setIsScanning(false);
      
      const errorCode = error.code || 'SCAN_FAILED';
      setPrinterError({ code: errorCode, message: error.message });
      
      toast({
        title: "Scan Failed",
        description: error.message || "Could not scan for printers",
        variant: "destructive"
      });
      return [];
    }
  }, [isNative, checkBluetoothPermission, toast]);

  const stopScanning = useCallback(async () => {
    try {
      const printer = await getThermalPrinter();
      if (printer) {
        await printer.stopScan();
      }
    } catch {
      // Ignore errors
    }
    setIsScanning(false);
  }, []);

  const connectToPrinter = useCallback(async (printer: PrinterDevice) => {
    setPrinterError(null);
    
    try {
      const thermalPrinter = await getThermalPrinter();
      if (!thermalPrinter) {
        throw new Error('Printer plugin not available');
      }

      const result = await thermalPrinter.connect({ address: printer.address });
      
      if (result) {
        setSelectedPrinter(printer);
        setIsConnected(true);
        
        // Save to localStorage for persistence
        localStorage.setItem('connectedPrinter', JSON.stringify(printer));
        
        toast({
          title: "Connected!",
          description: `Connected to ${printer.name}`
        });
        return true;
      } else {
        throw new Error('Connection failed');
      }
    } catch (error: any) {
      const errorCode = error.code || 'CONNECTION_FAILED';
      setPrinterError({ code: errorCode, message: error.message });
      
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect to printer. Check if it's powered on.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const disconnect = useCallback(async () => {
    try {
      const thermalPrinter = await getThermalPrinter();
      if (thermalPrinter) {
        await thermalPrinter.disconnect();
      }
    } catch {
      // Ignore disconnect errors
    }
    
    setSelectedPrinter(null);
    setIsConnected(false);
    setPrinterError(null);
    localStorage.removeItem('connectedPrinter');
    
    toast({
      title: "Disconnected",
      description: "Printer disconnected"
    });
  }, [toast]);

  const printReceipt = useCallback(async (
    items: CartItem[],
    total: number,
    tokenNumber: number,
    businessName: string = 'GODAVARI CAFE'
  ): Promise<boolean> => {
    if (isPrinting) return false; // Prevent double-prints
    
    setIsPrinting(true);
    setPrinterError(null);

    // For web/non-native, use browser print
    if (!isNative) {
      const result = printBrowserReceipt(items, total, tokenNumber, businessName);
      setIsPrinting(false);
      return result;
    }

    try {
      const thermalPrinter = await getThermalPrinter();
      if (!thermalPrinter) {
        setIsPrinting(false);
        return printBrowserReceipt(items, total, tokenNumber, businessName);
      }

      // PING printer first to check connection
      const connected = await thermalPrinter.isConnected();
      if (!connected) {
        setPrinterError({
          code: 'NOT_CONNECTED',
          message: 'Printer not connected',
        });
        toast({
          title: "Printer Not Connected",
          description: "Please connect to a printer first. Using browser print...",
          variant: "destructive"
        });
        setIsPrinting(false);
        return printBrowserReceipt(items, total, tokenNumber, businessName);
      }

      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN');
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      // Build receipt using ESC/POS commands - chain all commands
      let printChain = thermalPrinter.begin()
        .align('center')
        .bold()
        .text(`${businessName}\n`)
        .clearFormatting()
        .text(`${dateStr} | ${timeStr}\n`)
        .text('--------------------------------\n')
        .align('center')
        .text('TOKEN\n')
        .doubleWidth()
        .doubleHeight()
        .bold()
        .text(`#${tokenNumber}\n`)
        .clearFormatting()
        .text('--------------------------------\n')
        .align('left');

      // Add items
      for (const item of items) {
        printChain = printChain.text(`${item.name.padEnd(20)} x${item.quantity}\n`);
      }

      // Complete the receipt
      await printChain
        .align('center')
        .text('--------------------------------\n')
        .bold()
        .text(`Total: ₹${total}\n`)
        .clearFormatting()
        .text('\nThank You! Visit Again.\n\n\n')
        .cutPaper()
        .write();

      setIsPrinting(false);
      return true;
    } catch (error: any) {
      console.error('Print error:', error);
      
      // Check for specific error codes
      const errorCode = error.code || 'PRINT_FAILED';
      let errorMessage = error.message || 'Print failed';
      
      // Handle paper out error
      if (errorCode === 'NO_PAPER' || errorMessage.toLowerCase().includes('paper')) {
        setPrinterError({ code: 'NO_PAPER', message: 'Out of paper' });
        toast({
          title: "Printer Out of Paper",
          description: "Please refill the paper roll and try again",
          variant: "destructive"
        });
      } else {
        setPrinterError({ code: errorCode, message: errorMessage });
        toast({
          title: "Print Failed",
          description: "Trying browser print...",
          variant: "destructive"
        });
      }
      
      setIsPrinting(false);
      return printBrowserReceipt(items, total, tokenNumber, businessName);
    }
  }, [isNative, isPrinting, toast]);

  // Browser print fallback (uses hidden iframe)
  const printBrowserReceipt = (
    items: CartItem[],
    total: number,
    tokenNumber: number,
    businessName: string
  ): boolean => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    document.body.appendChild(iframe);

    const now = new Date();
    const doc = iframe.contentWindow?.document;
    
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Token #${tokenNumber}</title>
            <style>
              @page { size: 80mm auto; margin: 0; }
              @media print { body { -webkit-print-color-adjust: exact; } }
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                padding: 8px;
                margin: 0;
                width: 80mm;
              }
              .header { text-align: center; }
              .title { font-size: 16px; font-weight: bold; }
              .date { font-size: 10px; margin-top: 4px; }
              .divider { text-align: center; margin: 8px 0; }
              .token { text-align: center; margin: 16px 0; }
              .token-label { font-size: 10px; }
              .token-number { font-size: 32px; font-weight: 800; }
              .items { margin: 8px 0; }
              .item { display: flex; justify-content: space-between; margin: 2px 0; }
              .total { text-align: center; font-weight: bold; font-size: 14px; margin-top: 8px; }
              .footer { text-align: center; margin-top: 16px; font-size: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">${businessName}</div>
              <div class="date">${now.toLocaleDateString('en-IN')} | ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div class="divider">--------------------------------</div>
            <div class="token">
              <div class="token-label">TOKEN</div>
              <div class="token-number">#${tokenNumber}</div>
            </div>
            <div class="divider">--------------------------------</div>
            <div class="items">
              ${items.map(item => `<div class="item"><span>${item.name}</span><span>x${item.quantity}</span></div>`).join('')}
            </div>
            <div class="divider">--------------------------------</div>
            <div class="total">Total: ₹${total}</div>
            <div class="footer">Thank You! Visit Again.</div>
          </body>
        </html>
      `);
      doc.close();

      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }

    return true;
  };

  // Try to restore previously connected printer on mount
  const restoreConnection = useCallback(async () => {
    if (!isNative) return;
    
    const saved = localStorage.getItem('connectedPrinter');
    if (saved) {
      try {
        const printer = JSON.parse(saved) as PrinterDevice;
        const success = await connectToPrinter(printer);
        if (!success) {
          localStorage.removeItem('connectedPrinter');
        }
      } catch {
        localStorage.removeItem('connectedPrinter');
      }
    }
  }, [isNative, connectToPrinter]);

  return {
    isConnected,
    selectedPrinter,
    isScanning,
    availablePrinters,
    isNative,
    isPrinting,
    printerError,
    scanForPrinters,
    stopScanning,
    connectToPrinter,
    disconnect,
    printReceipt,
    restoreConnection,
    pingPrinter,
    checkBluetoothPermission,
  };
};
