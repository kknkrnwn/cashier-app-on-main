import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { generateQRIS } from '../utils/qris';
import { useApp } from '../context/AppContext';
import { Product, Transaction, CartItem } from '../types';
import { 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  Barcode, 
  Trash2, 
  Minus, 
  Plus, 
  CreditCard, 
  Coins, 
  QrCode,
  DollarSign, 
  CheckCircle, 
  FileText, 
  Printer, 
  Download,
  X,
  ShoppingCart,
  ChefHat,
  Clock
} from 'lucide-react';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import toast from 'react-hot-toast';

export const Kasir: React.FC = () => {
  const { 
    products, 
    categories, 
    cart, 
    addToCart, 
    updateCartQty, 
    removeFromCart, 
    clearCart, 
    completeTransaction,
    storeSettings,
    currentUser
  } = useApp();

  // Left Section States
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Checkout inputs
  const [pelanggan, setPelanggan] = useState('');
  const [diskon, setDiskon] = useState(0); // Nominal Rp diskon
  const [pajakPersen, setPajakPersen] = useState(11); // 11% PB1/PPN Default
  const [metodePembayaran, setMetodePembayaran] = useState<Transaction['metodePembayaran']>('Tunai');
  const [uangDibayar, setUangDibayar] = useState<number>(0);

  // Completed transaction reference for receipt modal
  const [completedTrx, setCompletedTrx] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [customerPaymentStep, setCustomerPaymentStep] = useState<'none' | 'pay_first' | 'order_processed'>('none');

  // Audio Beep generator for scan feedback
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // high pitched beep
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.08); // 80ms beep
    } catch (e) {
      console.warn('AudioContext not allowed or not supported in this window state.', e);
    }
  };

  // Set payment to exact total as convenience
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);
  const pajakNominal = Math.round((subtotal - diskon) * (pajakPersen / 100));
  const totalBill = Math.max(0, (subtotal - diskon) + pajakNominal);

  // Dynamic QRIS QR code Data URL state
  const [qrisDataUrl, setQrisDataUrl] = useState<string>('');

  useEffect(() => {
    const payload = storeSettings.rawQrisPayload?.trim()
      ? storeSettings.rawQrisPayload.trim()
      : generateQRIS({
          nmid: storeSettings.nmid,
          merchantName: storeSettings.namaToko,
          merchantId: storeSettings.merchantId,
          city: storeSettings.kota,
          postalCode: storeSettings.kodePos
        });

    QRCode.toDataURL(payload, {
      margin: 1,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
    .then(url => {
      setQrisDataUrl(url);
    })
    .catch(err => {
      console.error('Failed to generate dynamic QRIS code:', err);
    });
  }, [storeSettings]);

  useEffect(() => {
    // If not "Tunai" (Cash), default paid cash is automatically exact total Bill value
    if (metodePembayaran !== 'Tunai') {
      setUangDibayar(totalBill);
    } else if (uangDibayar === 0 || uangDibayar < totalBill) {
      setUangDibayar(totalBill);
    }
  }, [metodePembayaran, totalBill]);

  // Filters categories
  const categoryNames = useMemo(() => {
    return ['Semua', ...categories.map(c => c.nama)];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.nama.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
      const matchesKategori = selectedKategori === 'Semua' || p.kategori === selectedKategori;
      return matchesSearch && matchesKategori;
    });
  }, [products, search, selectedKategori]);

  // Handle Scan Callback
  const handleScanSuccess = (scannedBarcode: string) => {
    const product = products.find(p => p.barcode === scannedBarcode);
    if (product) {
      if (product.stok <= 0) {
        toast.error(`Katalog "${product.nama}" habis stok!`);
        return;
      }
      playScanBeep();
      addToCart(product, 1);
      toast.success(`Berhasil memindai ${product.nama} masuk keranjang!`, { icon: '🛒' });
    } else {
      toast.error(`Barcode "${scannedBarcode}" tidak terdaftar dalam produk sistem.`);
    }
  };

  // Check out execution
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Gagal checkout. Keranjang belanja kosong.');
      return;
    }

    if (currentUser === 'pelanggan' && !pelanggan.trim()) {
      toast.error('Untuk melanjutkan pesanan, mohon tulis Nama Anda atau Nomor Meja!');
      return;
    }

    if (currentUser === 'pelanggan') {
      if (metodePembayaran === 'Tunai') {
        try {
          const trx = completeTransaction(
            pelanggan,
            diskon,
            pajakPersen,
            metodePembayaran,
            totalBill
          );
          if (trx) {
            setCompletedTrx(trx);
            setCustomerPaymentStep('order_processed');
            toast.success('Pesanan Tunai sukses terkirim ke dapur!', { icon: '🍽️' });
            
            // Reset states
            setPelanggan('');
            setDiskon(0);
            setUangDibayar(0);
          }
        } catch (err: any) {
          toast.error(err.message || 'Gagal menyimpan transaksi.');
        }
        return;
      }

      // First show payment screen/modal ("Silakan bayar terlebih dahulu")
      setCustomerPaymentStep('pay_first');
      return;
    }

    const finalUangDibayar = uangDibayar;

    if (metodePembayaran === 'Tunai' && finalUangDibayar < totalBill) {
      toast.error(`Uang dibayar kurang dari nilai tagihan! Sisa tagihan Rp${(totalBill - finalUangDibayar).toLocaleString('id-ID')}`);
      return;
    }

    try {
      const trx = completeTransaction(
        pelanggan,
        diskon,
        pajakPersen,
        metodePembayaran,
        finalUangDibayar
      );
      if (trx) {
        setCompletedTrx(trx);
        setIsReceiptOpen(true);
        toast.success('Transaksi penjualan suskes disimpan!');
        
        // Reset states
        setPelanggan('');
        setDiskon(0);
        setUangDibayar(0);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan transaksi.');
    }
  };

  // Customer triggers transaction completion after verifying payment
  const handleCustomerFinishPayment = () => {
    try {
      const trx = completeTransaction(
        pelanggan,
        diskon,
        pajakPersen,
        metodePembayaran,
        totalBill
      );
      if (trx) {
        setCompletedTrx(trx);
        setCustomerPaymentStep('order_processed');
        toast.success('Terima kasih! Pembayaran sedang diproses dan pesanan Anda segera dibuat.', { icon: '🍽️' });
        
        // Reset states
        setPelanggan('');
        setDiskon(0);
        setUangDibayar(0);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyelesaikan pesanan.');
    }
  };

  // EXPORT RECEIPT PDF
  const downloadReceiptPDF = (trx: Transaction) => {
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 160] // POS Roll paper style dimensions
    });

    // Formatting Helpers
    const maxW = 70;
    const center = (text: string) => {
      const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
      return (80 - textWidth) / 2;
    };
    
    doc.setFont("courier", "bold");
    doc.setFontSize(11);
    doc.text(storeSettings.namaToko || 'CepatSaji Kasir', center(storeSettings.namaToko || 'CepatSaji Kasir'), 10);
    
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.text(storeSettings.alamat || 'Alamat Toko', center(storeSettings.alamat || 'Alamat Toko'), 14);
    doc.text(`Telp: ${storeSettings.telepon || '021-X'}`, center(`Telp: ${storeSettings.telepon || '021-X'}`), 18);
    
    doc.text('--------------------------------------', 5, 23);
    
    // Metadata block
    doc.text(`No: ${trx.id}`, 5, 27);
    doc.text(`Tgl: ${new Date(trx.tanggal).toLocaleString('id-ID')}`, 5, 31);
    doc.text(`Kasir: Admin Toko`, 5, 35);
    doc.text(`Cust: ${trx.pelanggan}`, 5, 39);
    
    doc.text('--------------------------------------', 5, 43);
    
    // Items table loop
    let y = 47;
    trx.items.forEach(itm => {
      // Print product name (can wrap if long)
      const nameShort = itm.nama.length > 25 ? itm.nama.slice(0, 24) + '..' : itm.nama;
      doc.text(nameShort, 5, y);
      y += 4;
      
      const qtyLine = `${itm.qty} x Rp${itm.harga.toLocaleString('id-ID')}`;
      doc.text(qtyLine, 7, y);
      
      const subtotalStr = `Rp${itm.subtotal.toLocaleString('id-ID')}`;
      const rightAlignPos = 75 - (doc.getStringUnitWidth(subtotalStr) * doc.getFontSize() / doc.internal.scaleFactor);
      doc.text(subtotalStr, rightAlignPos, y);
      
      y += 5;
    });
    
    doc.text('--------------------------------------', 5, y);
    y += 4;
    
    // Totals Math
    const printTotalLine = (label: string, value: number) => {
      doc.text(label, 5, y);
      const valStr = `Rp${value.toLocaleString('id-ID')}`;
      const rightAlignPos = 75 - (doc.getStringUnitWidth(valStr) * doc.getFontSize() / doc.internal.scaleFactor);
      doc.text(valStr, rightAlignPos, y);
      y += 4.5;
    };

    printTotalLine('Subtotal', trx.subtotal);
    if (trx.diskon > 0) printTotalLine('Diskon', -trx.diskon);
    printTotalLine('Pajak (PPN)', trx.pajak);
    
    doc.setFont("courier", "bold");
    printTotalLine('GRAND TOTAL', trx.total);
    
    doc.setFont("courier", "normal");
    printTotalLine('Bayar', trx.uangDibayar);
    printTotalLine('Kembali', trx.kembalian);
    
    y += 3;
    doc.text('--------------------------------------', 5, y);
    y += 4;
    doc.text('Terima Kasih Atas Kunjungan Anda', center('Terima Kasih Atas Kunjungan Anda'), y);
    y += 4;
    doc.text('Barang yang dibeli tidak dapat ditukar', center('Barang yang dibeli tidak dapat ditukar'), y);

    doc.save(`${trx.id}.pdf`);
  };

  // DIRECT BRWOSER PRINT
  const printReceiptElement = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-160px)] lg:max-h-[850px]">
      
      {/* LEFT COLUMN: Product Catalog (Span 7) */}
      <section className="col-span-1 lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 flex flex-col justify-between overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800 h-[600px] lg:h-full">
        
        {/* Upper search & scanning row */}
        <div className="space-y-3.5 mb-4 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-600" />
              Menu Transaksi Kasir
            </h3>
            
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl text-xs font-bold text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-400 transition-all cursor-pointer"
            >
              <Barcode className="h-4 w-4" />
              Scan Barcode / Kamera
            </button>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Search Input bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ketik nama makanan, minuman, barcode..."
                className="w-full bg-slate-50 border border-gray-200 outline-none rounded-xl pl-9.5 pr-4 py-2.5 text-xs font-semibold text-gray-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white placeholder:text-zinc-400 focus:border-emerald-500"
              />
            </div>

            {/* Category dropdown picker */}
            <div className="w-40 shrink-0 relative">
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-gray-200 outline-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 pl-8.5 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 focus:border-emerald-500 cursor-pointer"
              >
                {categoryNames.map(name => (
                  <option className="bg-white text-gray-900 dark:bg-zinc-900 dark:text-gray-100 font-semibold" key={name} value={name}>{name}</option>
                ))}
              </select>
              <SlidersHorizontal className="absolute left-3 top-3.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            </div>

          </div>
        </div>

        {/* Scrollable grid cards products */}
        <div className="flex-1 overflow-y-auto pr-1 pb-3 scrollbar-thin">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredProducts.map((p) => {
              const inStock = p.stok > 0;
              const cartCount = cart.find(i => i.productId === p.id)?.qty || 0;
              
              return (
                <button
                  key={p.id}
                  disabled={!inStock}
                  onClick={() => addToCart(p, 1)}
                  className={`relative p-3.5 rounded-xl border flex flex-col justify-between text-left transition-all ${
                    inStock 
                      ? 'bg-white border-gray-200 hover:border-emerald-500 dark:bg-zinc-900 dark:border-zinc-800 cursor-pointer active:scale-97' 
                      : 'bg-gray-50 border-gray-200 opacity-60 dark:bg-zinc-950 dark:border-zinc-900'
                  }`}
                >
                  {/* Photo thumbnail */}
                  <div className="w-full aspect-video rounded-lg max-h-24 overflow-hidden mb-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800">
                    <img 
                      src={p.gambar} 
                      alt={p.nama} 
                      className="w-full h-full object-cover shrink-0" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>

                  {/* Badges Count */}
                  {cartCount > 0 && (
                    <span className="absolute right-2 top-2 h-5.5 w-5.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center animate-bounce shadow">
                      {cartCount}
                    </span>
                  )}

                  {!inStock && (
                    <span className="absolute right-2 top-2 px-1.5 py-0.5 bg-rose-600 text-white font-bold text-[8px] rounded uppercase shadow-sm">
                      HABIS
                    </span>
                  )}

                  {/* Metadata */}
                  <div className="space-y-1">
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 truncate uppercase font-bold">{p.kategori}</p>
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white leading-tight truncate-2-lines line-clamp-2 h-7" title={p.nama}>
                      {p.nama}
                    </h4>
                  </div>

                  {/* Price and Inventory stock info */}
                  <div className="flex items-center justify-between border-t border-gray-55 dark:border-zinc-800 pt-2.5 mt-2.5">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      Rp{p.harga.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-400 font-mono">
                      Sisa: {p.stok}
                    </span>
                  </div>

                </button>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center text-zinc-400 text-xs">
                Katalog produk pencarian nihil.
              </div>
            )}
          </div>
        </div>

        {/* Lower indicator stats */}
        <div className="shrink-0 h-9.5 flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-2 text-[10px] text-zinc-400 uppercase tracking-wide">
          <span>Menampilkan {filteredProducts.length} Katalog</span>
          <span className="text-emerald-600 font-bold dark:text-emerald-400">Siap Ditambahkan</span>
        </div>

      </section>

      {/* RIGHT COLUMN: Shopping Cart (Span 5) */}
      <section className="col-span-1 lg:col-span-5 bg-white rounded-2xl border border-gray-200 flex flex-col justify-between overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800 h-[550px] lg:h-full">
        
        {/* Cart items list section */}
        <div className="p-4 bg-slate-50 border-b border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 rounded-lg dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
              <ShoppingCart className="h-4.5 w-4.5" />
            </span>
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Isi Keranjang Belanja</h3>
          </div>
          
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="text-[10px] font-extrabold text-rose-600 hover:underline disabled:opacity-45 disabled:no-underline cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" /> Bersihkan
          </button>
        </div>

        {/* Cart Item Scrolling list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
          {cart.map((item) => (
            <div 
              key={item.productId}
              className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-zinc-800 last:border-none last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-gray-950 dark:text-white truncate" title={item.nama}>
                  {item.nama}
                </h4>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-mono mt-0.5">
                  Rp{item.harga.toLocaleString('id-ID')}
                </p>
              </div>

              {/* Qty incrementors */}
              <div className="flex items-center border border-gray-200/80 rounded-xl bg-white dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
                <button
                  type="button"
                  onClick={() => updateCartQty(item.productId, item.qty - 1)}
                  className="p-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-l-xl text-gray-500 dark:text-zinc-400 cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold font-mono text-zinc-800 dark:text-white">
                  {item.qty}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const originalStock = products.find(p => p.id === item.productId)?.stok || 999;
                    if (item.qty >= originalStock) {
                      toast.error('Kehabisan kuota persediaan stok produk!');
                      return;
                    }
                    updateCartQty(item.productId, item.qty + 1);
                  }}
                  className="p-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-r-xl text-gray-500 dark:text-zinc-400 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Subtotal of item */}
              <div className="text-right w-24 shrink-0">
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-350 font-mono">
                  Rp{item.subtotal.toLocaleString('id-ID')}
                </p>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFromCart(item.productId)}
                className="text-gray-400 hover:text-rose-500 shrink-0 pl-1 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>

            </div>
          ))}

          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-440 py-20">
              <ShoppingCart className="h-10 w-10 text-zinc-300 stroke-1 mb-2 animate-bounce" />
              <p className="text-xs font-bold text-gray-400">Keranjang Belanja Masih Kosong</p>
              <p className="text-[10px] text-zinc-400 mt-1">Pilih atau scan katalog produk di kolom kiri</p>
            </div>
          )}
        </div>

        {/* Checkout Detail Form Bottom section */}
        <div className="p-4 border-t border-gray-200 bg-slate-50 dark:bg-zinc-950/20 dark:border-zinc-800 shrink-0 space-y-3.5">
          
          {/* Discount and tax row inputs */}
          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div className={currentUser === 'pelanggan' ? 'col-span-2 space-y-1' : 'space-y-1'}>
              <label className="font-bold text-gray-700 dark:text-zinc-300">
                {currentUser === 'pelanggan' ? 'Nama Anda / Nomor Meja *' : 'Nama Pelanggan'}
              </label>
              <input
                type="text"
                placeholder={currentUser === 'pelanggan' ? 'Contoh: Meja 5 - Budi (Wajib diisi)' : 'Walk-in Customer'}
                value={pelanggan}
                onChange={(e) => setPelanggan(e.target.value)}
                className="w-full bg-white border border-gray-200 outline-none rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white placeholder:text-zinc-400 font-semibold"
                required={currentUser === 'pelanggan'}
              />
            </div>
            {currentUser !== 'pelanggan' && (
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-zinc-300">Potongan Diskon (Rp)</label>
                <input
                  type="number"
                  min={0}
                  max={subtotal}
                  value={diskon}
                  onChange={(e) => setDiskon(Math.min(subtotal, Math.max(0, Number(e.target.value))))}
                  className="w-full bg-white border border-gray-200 outline-none rounded-xl px-3 py-1.5 text-xs font-mono dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Payment methodology icons row */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">Rencana Pembayaran</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMetodePembayaran('Tunai')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  metodePembayaran === 'Tunai'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                }`}
              >
                <Coins className="h-4 w-4 shrink-0" /> Tunai
              </button>
              <button
                type="button"
                onClick={() => setMetodePembayaran('QRIS')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  metodePembayaran === 'QRIS'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                }`}
              >
                <QrCode className="h-4 w-4 shrink-0" /> QRIS / E-Wallet
              </button>
              <button
                type="button"
                onClick={() => setMetodePembayaran('Transfer')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  metodePembayaran === 'Transfer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                }`}
              >
                <CreditCard className="h-4 w-4 shrink-0" /> Transfer
              </button>
            </div>
          </div>

          {/* Cash Tunai entry details if cash selected */}
          {currentUser !== 'pelanggan' && metodePembayaran === 'Tunai' && (
            <div className="space-y-1 animate-in slide-in-from-top-1 px-1 duration-100">
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">Uang Tunai Diterima (Rp)</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={totalBill}
                  value={uangDibayar}
                  onChange={(e) => setUangDibayar(Number(e.target.value))}
                  className="flex-1 bg-white border border-gray-200 outline-none rounded-xl px-3.5 py-1 text-sm font-semibold font-mono dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                />
                {/* Fast amount buttons */}
                {[totalBill, 50000, 100000].map(amt => {
                  const labelStr = amt === totalBill ? 'Uang Pas' : amt / 1000 + 'k';
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setUangDibayar(amt)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-600 dark:text-zinc-300"
                    >
                      {labelStr}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mathematical breakdowns box */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500 font-semibold">Subtotal</span>
              <span className="font-semibold font-mono">Rp{subtotal.toLocaleString('id-ID')}</span>
            </div>
            {diskon > 0 && (
              <div className="flex justify-between text-rose-600 font-medium font-mono">
                <span>Diskon Langsung</span>
                <span>-Rp{diskon.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-500 font-semibold">Pajak Pertambahan Nilai ({pajakPersen}%)</span>
              <span className="font-semibold font-mono">Rp{pajakNominal.toLocaleString('id-ID')}</span>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between text-sm gallery-breakdown">
              <span className="text-gray-950 font-bold dark:text-white">TOTAL TAGIHAN</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-base">
                Rp{totalBill.toLocaleString('id-ID')}
              </span>
            </div>

            {currentUser !== 'pelanggan' && metodePembayaran === 'Tunai' && uangDibayar >= totalBill && (
              <div className="flex justify-between text-[11px] font-semibold text-zinc-500 pt-1">
                <span>Kembalian</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-300">
                  Rp{(uangDibayar - totalBill).toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>

          {/* Checkout Submit trigger Button */}
          <button
            type="button"
            onClick={handleCheckoutSubmit}
            disabled={cart.length === 0}
            className={`w-full flex items-center justify-center gap-2 py-3 text-xs font-black text-white rounded-xl shadow-lg active:scale-97 disabled:opacity-45 disabled:pointer-events-none transition-all cursor-pointer ${
              currentUser === 'pelanggan'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/10'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10'
            }`}
          >
            {currentUser === 'pelanggan' ? (
              <>
                <ShoppingCart className="h-4.5 w-4.5" />
                Kirim & Buat Pesanan (Rp{totalBill.toLocaleString('id-ID')})
              </>
            ) : (
              <>
                <DollarSign className="h-4.5 w-4.5" />
                Selesaikan & Cetak Nota (Rp{totalBill.toLocaleString('id-ID')})
              </>
            )}
          </button>

          {currentUser === 'pelanggan' && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold text-center italic mt-1 bg-amber-50 dark:bg-amber-950/20 py-1.5 px-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
              ⚠️ Pesanan akan masuk ke sistem antrean. Mohon infokan nama/no. meja pada kasir saat melakukan pembayaran.
            </p>
          )}

        </div>

      </section>

      {/* Embedded Camera Scanners Panel */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* RECEIPT MODAL POPUP after transaction complete */}
      {currentUser === 'pelanggan' && customerPaymentStep === 'pay_first' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-120">
            
            {/* Header Status */}
            <div className="p-6 text-center border-b border-gray-100 dark:border-zinc-800 bg-amber-500/15 dark:bg-amber-950/20 relative">
              <div className="absolute top-4 right-4">
                <span className="inline-flex h-3 w-3 rounded-full bg-amber-500 animate-ping" />
              </div>
              <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-base font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                Silakan Bayar Terlebih Dahulu
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-1.5 font-bold leading-relaxed">
                Pembayaran Anda aman. Pesanan akan diteruskan ke dapur setelah konfirmasi pembayaran selesai.
              </p>
            </div>

            {/* Order Details & Barcode */}
            <div className="p-6 space-y-5 max-h-[380px] overflow-y-auto">
              
              {/* Client & Billing Info */}
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-gray-100/70 dark:border-zinc-800 space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  <span>Pelanggan/Meja:</span>
                  <span className="text-gray-900 dark:text-white font-extrabold truncate max-w-[150px]">{pelanggan}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  <span>Metode Pembayaran:</span>
                  <span className="bg-blue-500/15 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 rounded-full px-2.5 py-0.5 text-[10px] font-black">{metodePembayaran}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-zinc-500 dark:text-zinc-400 pt-1.5 border-t border-gray-100 dark:border-zinc-800">
                  <span>Total yang Harus Dibayar:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-black text-base font-mono">Rp{totalBill.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Payment Visual blocks based on Selected Method */}
              {(metodePembayaran === 'QRIS' || metodePembayaran === 'Transfer') && (
                <div className="text-center space-y-3.5 pt-1">
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-950/30 py-2 px-3 rounded-xl border border-blue-500/20 uppercase tracking-wider">
                    📲 Pindai Barcode / QR Resmi Toko Di Bawah Ini:
                  </p>
                  
                  {/* High Quality QRIS Graphic Layout */}
                  <div className="relative mx-auto w-full max-w-[280px] p-5 bg-white border border-gray-200 rounded-2xl shadow-md flex flex-col items-center select-none overflow-hidden text-zinc-950">
                    {/* Corner Red Triangles & Side Badges matching standard QRIS templates */}
                    <div className="absolute left-0 top-[25%] bottom-[45%] w-3.5 bg-[#d1191e]" style={{ clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)' }} />
                    <div className="absolute right-0 bottom-0 w-16 h-16 bg-[#d1191e]" style={{ clipPath: 'polygon(100% 0%, 100% 100%, 0% 100%)' }} />

                    {/* Standard QRIS Header with GPN Logo */}
                    <div className="w-full flex items-center justify-between border-b pb-2.5 mb-3.5 border-gray-150 relative z-10">
                      <div className="flex items-center">
                        {/* High-accuracy QRIS letters SVG outline */}
                        <svg viewBox="0 0 100 24" className="h-[18px] w-auto fill-current text-zinc-900 shrink-0">
                          {/* Q */}
                          <path d="M1,2 L14,2 C16,2 17,3 17,5.5 L17,14 C17,16.5 16,17.5 14,17.5 L10.5,17.5 L10.5,23 L6.5,23 L6.5,17.5 L1,17.5 C-1,17.5 -1,16.5 -1,14 L-1,5.5 C-1,3 1,2 1,2 Z M3,5 L3,14 L13,14 L13,5 Z" />
                          {/* R */}
                          <path d="M21,2 L28,2 C31,2 32.5,3.5 32.5,5.5 C32.5,7.5 31,9.5 28,10 L32.5,23 L28,23 L24.5,11 L24.5,23 L21,23 Z M24.5,5.5 L24.5,8.5 L27.5,8.5 C28.5,8.5 29,8 29,7 C29,6 28.5,5.5 27.5,5.5 Z" />
                          {/* I */}
                          <path d="M36,2 L39.5,2 L39.5,23 L36,23 Z" />
                          {/* S */}
                          <path d="M43,2 L52,2 L52,5.5 L47.5,5.5 L47.5,8.5 L52,8.5 L52,23 L43,23 L43,19.5 L47.5,19.5 L47.5,12.5 L43,12.5 Z" />
                        </svg>

                        {/* vertical line separator */}
                        <div className="h-6 w-[1.5px] bg-zinc-900 mx-2 shrink-0" />

                        {/* description tags */}
                        <div className="flex flex-col text-left leading-[1.05] text-zinc-900">
                          <span className="text-[6.5px] font-black uppercase tracking-normal">QR Code Standar</span>
                          <span className="text-[6.5px] font-black uppercase tracking-normal mt-0.5">Pembayaran Nasional</span>
                        </div>
                      </div>

                      {/* GPN Red Eagle Brand Icon */}
                      <div className="flex flex-col items-center shrink-0">
                        <svg viewBox="0 0 45 45" className="h-[21px] w-[21px] text-[#d1191e] fill-current">
                          <path d="M 5,22 C 9,18 15,14 18,10 C 16,14 14,19 13.5,22 C 18.5,17 24,13 29,8 C 25.5,13 22,18 19,23.5 C 25,19 32,15 36.5,10.5 C 31.5,16 26.5,21.5 21,26.5 C 27.5,23.5 34,20 39,16 C 32,22 25,27.5 16,29 C 13,29.5 10,29 8.5,27 Z" />
                        </svg>
                        <span className="text-[7.5px] font-[1000] text-[#0d2a45] italic -mt-0.5 leading-none">GPN</span>
                      </div>
                    </div>

                    {/* Store Title section */}
                    <div className="text-center mb-3 relative z-10 w-full px-2">
                      <h3 className="text-sm font-extrabold tracking-wide text-zinc-900 uppercase font-sans truncate" title={storeSettings.namaToko}>
                        {storeSettings.namaToko || 'IT TECH SOLUTION'}
                      </h3>
                      <p className="text-[8.5px] font-bold text-zinc-600 tracking-wider mt-0.5">
                        NMID : {storeSettings.nmid || 'ID1026514400302'}
                      </p>
                    </div>

                    {/* Clean QR code canvas wrapper */}
                    <div className="p-2.5 border border-gray-150 bg-white rounded-xl relative z-10 shadow-xs mb-3 flex items-center justify-center">
                      {qrisDataUrl ? (
                        <img 
                          src={qrisDataUrl} 
                          alt="QRIS payment code" 
                          className="w-[155px] h-[155px] select-none pointer-events-none" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-[155px] h-[155px] bg-slate-100 animate-pulse rounded flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                          Membuat Barcode...
                        </div>
                      )}
                    </div>

                    {/* Printable Metadata Footer */}
                    <div className="w-full text-left relative z-10">
                      <span className="text-[7px] text-zinc-400 font-bold tracking-wide">
                        Dicetak oleh: {storeSettings.merchantId || '93600915'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-3 rounded-2xl text-[10px] leading-relaxed text-zinc-500 font-extrabold text-center">
                    {metodePembayaran === 'Transfer' ? (
                      <div className="space-y-1 block">
                        <p className="text-gray-955 dark:text-white uppercase font-black text-[10px]">Informasi Rekening Bank:</p>
                        <p className="font-mono text-xs text-blue-600 dark:text-blue-400">BCA 772-019-9133</p>
                        <p className="text-[9px] text-zinc-400 font-medium">a/n PT CepatSaji Kuliner Indonesia</p>
                      </div>
                    ) : (
                      <p>Silakan pindai / download QRIS di atas untuk menyelesaikan otomatis.</p>
                    )}
                  </div>
                </div>
              )}

              {metodePembayaran === 'Tunai' && (
                <div className="bg-rose-50 border border-rose-100 dark:bg-rose-955/20 dark:border-rose-900/30 p-4.5 rounded-2xl flex items-start gap-3">
                  <span className="text-lg leading-none">💰</span>
                  <div className="text-[11px] font-bold text-rose-800 dark:text-rose-350 space-y-1">
                    <p className="font-extrabold uppercase text-xs">Instruksi Pembayaran Tunai</p>
                    <p className="font-medium text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Silakan membayarkan uang tunai sejumlah <span className="font-mono font-extrabold text-rose-700 dark:text-rose-450 text-xs">Rp{totalBill.toLocaleString('id-ID')}</span> ke meja Kasir Utama. Sebutkan nama/no. meja Anda (<span className="font-black underline">{pelanggan}</span>).
                    </p>
                  </div>
                </div>
              )}

              {/* Items summary */}
              <div className="space-y-2 border-t border-gray-100 dark:border-zinc-800 pt-4">
                <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider block">Ringkasan Keranjang Anda</span>
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                  {cart.map((itm) => (
                    <div key={itm.productId} className="flex justify-between text-[11px] font-bold text-gray-700 dark:text-zinc-400">
                      <span>{itm.nama} <span className="text-zinc-400 font-medium font-sans">x{itm.qty}</span></span>
                      <span className="font-mono">Rp{itm.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Action buttons */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 flex gap-3 text-xs">
              <button
                type="button"
                onClick={() => setCustomerPaymentStep('none')}
                className="flex-1 py-3 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 rounded-xl font-bold cursor-pointer hover:bg-gray-50 transition-all text-center select-none"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleCustomerFinishPayment}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer text-center select-none uppercase tracking-wide transition-all"
              >
                Saya Sudah Bayar
              </button>
            </div>

          </div>
        </div>
      )}

      {currentUser === 'pelanggan' && customerPaymentStep === 'order_processed' && completedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-120">
            
            {/* Cooking Chef animation banner */}
            <div className="p-6 text-center border-b border-gray-100 dark:border-zinc-800 bg-emerald-500/10 dark:bg-emerald-950/20 relative">
              <div className="mx-auto w-14 h-14 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-3 animate-bounce">
                <ChefHat className="h-7 w-7" />
              </div>
              <h3 className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                Pesanan Diproses, Harap Menunggu!
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-1.5 font-bold leading-relaxed">
                Antrean berhasil dibuat! Koki kami di dapur sedang meracik hidangan lezat pesanan Anda.
              </p>
            </div>

            {/* Receipt invoice description */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-gray-100/70 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-500 font-bold dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>No. Antrean Invoice:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">{completedTrx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nama / No. Meja:</span>
                  <span className="text-gray-955 dark:text-white font-extrabold truncate">{completedTrx.pelanggan}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode Pembayaran:</span>
                  <span className="bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] uppercase font-black">{completedTrx.metodePembayaran}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-900 dark:text-white font-black pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <span>Total Tagihan:</span>
                  <span className="font-mono">Rp{completedTrx.total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider font-sans">Menu yang sedang dibuat:</span>
                <div className="divide-y divide-gray-100 dark:divide-zinc-900/60 max-h-[140px] overflow-y-auto">
                  {completedTrx.items.map((itm) => (
                    <div key={itm.productId} className="flex justify-between py-1.5 first:pt-0 font-bold text-xs text-zinc-700 dark:text-zinc-300">
                      <span>{itm.nama} <span className="text-zinc-400 font-medium">x{itm.qty}</span></span>
                      <span className="font-mono">Rp{itm.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/50 dark:bg-zinc-900 border border-blue-100/50 dark:border-blue-900/20 text-[10px] text-zinc-500 leading-relaxed font-bold rounded-2xl italic text-center">
                📢 Mohon infokan nama/meja (<span className="font-black text-gray-800 dark:text-white">{completedTrx.pelanggan}</span>) ke petugas pelayan bila Anda membutuhkan bantuan lebih lanjut. Selamat menikmati!
              </div>

            </div>

            {/* Back action button */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setCustomerPaymentStep('none');
                  setCompletedTrx(null);
                  clearCart(); // Clear active client cart now that order has been happily placed!
                }}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer text-center select-none transition-all"
              >
                Selesai & Pesan Menu Lain
              </button>
            </div>

          </div>
        </div>
      )}

      {isReceiptOpen && completedTrx && currentUser !== 'pelanggan' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-120">
            
            <div className="p-4 border-b border-gray-100 flex items-center justify-between dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold dark:text-emerald-450">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Transaksi Sukses!
              </div>
              <button
                onClick={() => {
                  setIsReceiptOpen(false);
                  setCompletedTrx(null);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Simulated Receipt paper content */}
            <div className="p-6 overflow-y-auto max-h-[350px]" id="invoice-sheet-printable">
              <div className="text-center font-mono space-y-1.5 text-[11px] text-zinc-800 dark:text-zinc-350">
                
                <h4 className="text-base font-extrabold text-gray-900 dark:text-white uppercase leading-none">
                  {storeSettings.namaToko || 'CepatSaji Kasir'}
                </h4>
                <p>{storeSettings.alamat || 'Alamat Toko'}</p>
                <p>Telp: {storeSettings.telepon || '021-X'}</p>
                <p>===================================</p>
                
                <div className="text-left space-y-1 text-[10px]">
                  <p>Kode   : {completedTrx.id}</p>
                  <p>Tgl    : {new Date(completedTrx.tanggal).toLocaleString('id-ID')}</p>
                  <p>Cust   : {completedTrx.pelanggan}</p>
                  <p>Metode : {completedTrx.metodePembayaran}</p>
                </div>
                
                <p>===================================</p>
                
                {/* items table loop lists */}
                <div className="text-left space-y-2 text-[10px]">
                  {completedTrx.items.map((itm) => (
                    <div key={itm.productId}>
                      <p className="font-bold truncate text-gray-950 dark:text-white">{itm.nama}</p>
                      <div className="flex justify-between pl-2">
                        <span>{itm.qty} x Rp{itm.harga.toLocaleString('id-ID')}</span>
                        <span className="font-bold font-mono">Rp{itm.subtotal.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <p>===================================</p>

                {/* Sub & totals */}
                <div className="text-right space-y-1 text-[10px] pl-8">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rp{completedTrx.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {completedTrx.diskon > 0 && (
                    <div className="flex justify-between">
                      <span>Diskon:</span>
                      <span>-Rp{completedTrx.diskon.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Pajak:</span>
                    <span>Rp{completedTrx.pajak.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-gray-950 dark:text-white text-xs">
                    <span>Total:</span>
                    <span>Rp{completedTrx.total.toLocaleString('id-ID')}</span>
                  </div>
                  <p>-----------------------------------</p>
                  <div className="flex justify-between">
                    <span>Bayar:</span>
                    <span>Rp{completedTrx.uangDibayar.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-950 dark:text-white">
                    <span>Kembalian:</span>
                    <span>Rp{completedTrx.kembalian.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <p className="mt-4">===================================</p>
                <p className="font-bold">TERIMA KASIH</p>
                <p>Silakan berkunjung kembali</p>

              </div>
            </div>

            {/* Receipt Modal Trigger footer */}
            <div className="bg-slate-50 dark:bg-zinc-900 p-4 border-t border-gray-100 dark:border-zinc-800 flex gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => downloadReceiptPDF(completedTrx)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-300 dark:border-zinc-800 text-gray-700 bg-white dark:bg-zinc-950 dark:text-zinc-200 hover:bg-gray-100 rounded-xl font-bold cursor-pointer transition-all"
              >
                <Download className="h-4 w-4" /> Download PDF
              </button>
              <button
                type="button"
                onClick={printReceiptElement}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black cursor-pointer shadow-md shadow-emerald-500/10 transition-all"
              >
                <Printer className="h-4 w-4" /> Cetak Struk
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
