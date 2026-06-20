import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const { products } = useApp();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const readerId = 'qrcode-reader-element';

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      // Wait for DOM
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setErrorMsg(null);
      setIsScanning(true);
      
      const html5QrCode = new Html5Qrcode(readerId);
      html5QrCodeRef.current = html5QrCode;

      // Ask for permission and get back facing camera or any camera
      const config = { fps: 10, qrbox: { width: 250, height: 150 } };
      
      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          // Success!
          onScanSuccess(decodedText);
          stopScanner();
          onClose();
        },
        () => {
          // Failure callback is spammy, keep quiet
        }
      );
    } catch (err: any) {
      console.warn('Camera scan start failed, fallback to manual input or alternative cameras.', err);
      setErrorMsg('Kamera tidak dapat diakses atau diblokir. Harap gunakan input manual atau berikan izin kamera.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
    html5QrCodeRef.current = null;
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
      onClose();
      setManualCode('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg dark:bg-emerald-950/40 dark:text-emerald-400">
              <Camera className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-950 dark:text-white">Barcode Scanner</h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Scan barcode produk dengan kamera</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scanner Content */}
        <div className="p-5 flex flex-col items-center">
          
          {/* Reader Window */}
          <div className="relative w-full aspect-video max-w-sm overflow-hidden rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 mb-4 shadow-inner">
            <div id={readerId} className="w-full h-full object-cover"></div>
            
            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-zinc-950/70 text-zinc-400 z-10">
                <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                <p className="text-sm font-medium">Uji Coba Simulator Barcode</p>
                <p className="text-xs text-zinc-500 mt-1">Gunakan input barcode manual di bawah untuk mengetik kode produk simulator.</p>
              </div>
            )}
            
            {/* Guide overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none border-[30px] border-black/40 flex items-center justify-center">
                <div className="w-48 h-24 border-2 border-emerald-500 relative flex items-center justify-center">
                  <div className="absolute h-0.5 bg-emerald-500 left-0 right-0 animate-bounce"></div>
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="w-full mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
                <button 
                  onClick={startScanner}
                  className="mt-1 flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <RefreshCw className="h-3 w-3" /> Coba Lagi
                </button>
              </div>
            </div>
          )}

          {/* Quick Barcode Helper Simulator */}
          <div className="w-full mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100 dark:bg-zinc-800/40 dark:border-zinc-800/60">
            <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Barcode Produk Tersedia (Simulator)
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pr-1">
              {products.slice(0, 5).map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setManualCode(p.barcode);
                  }}
                  className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 hover:border-emerald-500 rounded text-gray-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-emerald-400 truncate max-w-[130px]"
                  title={`${p.nama}: ${p.barcode}`}
                >
                  {p.nama}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleManualSubmit} className="w-full flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ketik barcode produk di sini..."
              className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 active:scale-95 transition-all outline-none"
            >
              Masukkan
            </button>
          </form>

        </div>
        
        {/* Footer info */}
        <div className="bg-gray-50 p-3.5 text-center text-[10px] text-gray-400 border-t border-gray-100 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-500">
          Mendukung EAN-13, QR Code, Code 128, dan format barcode retail standar.
        </div>
      </div>
    </div>
  );
};
