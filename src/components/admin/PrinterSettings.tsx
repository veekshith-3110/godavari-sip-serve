import { useState } from 'react';
import { Printer, Bluetooth, BluetoothSearching, Check, X, TestTube, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePrinter } from '@/hooks/usePrinter';
import { useToast } from '@/hooks/use-toast';

const PrinterSettings = () => {
  const {
    isConnected,
    selectedPrinter,
    isScanning,
    availablePrinters,
    isNative,
    scanForPrinters,
    connectToPrinter,
    disconnect,
    printReceipt
  } = usePrinter();
  const { toast } = useToast();

  const handleTestPrint = async () => {
    const testItems = [
      { name: 'Test Item 1', price: 100, quantity: 2 },
      { name: 'Test Item 2', price: 50, quantity: 1 }
    ];
    
    const success = await printReceipt(testItems, 250, 999);
    
    if (success) {
      toast({
        title: "Test Print Sent",
        description: "Check your printer for the test receipt"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Printer Settings</h1>
        <p className="text-muted-foreground">Connect and manage your receipt printer</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="font-medium">
                  {isConnected ? selectedPrinter?.name || 'Connected' : 'Not Connected'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? 'Ready to print' : 'No printer connected'}
                </p>
              </div>
            </div>
            {isConnected && (
              <Button variant="outline" size="sm" onClick={disconnect}>
                <X className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bluetooth Printers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bluetooth className="w-5 h-5" />
            Bluetooth Printers
          </CardTitle>
          <CardDescription>
            {isNative 
              ? 'Scan for nearby Bluetooth thermal printers'
              : 'Bluetooth printing requires the native mobile app'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={scanForPrinters} 
            disabled={isScanning}
            className="w-full"
          >
            {isScanning ? (
              <>
                <BluetoothSearching className="w-4 h-4 mr-2 animate-pulse" />
                Scanning...
              </>
            ) : (
              <>
                <BluetoothSearching className="w-4 h-4 mr-2" />
                Scan for Printers
              </>
            )}
          </Button>

          {/* Found Printers List */}
          {availablePrinters.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Found Printers:</p>
              {availablePrinters.map((printer) => (
                <div
                  key={printer.address}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Printer className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{printer.name}</p>
                      <p className="text-xs text-muted-foreground">{printer.address}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => connectToPrinter(printer)}
                    disabled={isConnected && selectedPrinter?.address === printer.address}
                  >
                    {isConnected && selectedPrinter?.address === printer.address ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Connected
                      </>
                    ) : (
                      'Connect'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!isNative && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                <strong>Note:</strong> To use Bluetooth printers, you need to build and install the native mobile app. 
                For now, you can use the browser's print function with any USB or network printer.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Browser Print (Fallback) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Browser / Network Print
          </CardTitle>
          <CardDescription>
            Use your system's default printer via the browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">How it works:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Connect your printer to your computer via USB or WiFi</li>
              <li>Make sure the printer is set as default in your system</li>
              <li>When you print a receipt, the browser print dialog will open</li>
              <li>Select your printer and click Print</li>
            </ol>
          </div>

          <Button variant="outline" onClick={handleTestPrint} className="w-full">
            <TestTube className="w-4 h-4 mr-2" />
            Print Test Receipt
          </Button>
        </CardContent>
      </Card>

      {/* Paper Size Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Paper</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">80mm Thermal Paper</p>
                <p className="text-sm text-muted-foreground">Standard POS receipt size</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-600 rounded">
                Recommended
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">58mm Thermal Paper</p>
                <p className="text-sm text-muted-foreground">Compact / portable printers</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded">
                Alternative
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrinterSettings;
