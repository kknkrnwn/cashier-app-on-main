import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  Search, 
  Trash2, 
  Eye, 
  X, 
  Calendar, 
  Coins, 
  QrCode, 
  CreditCard,
  Printer, 
  Download,
  Receipt,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Transaksi: React.FC = () => {
  const { transactions, deleteTransaction, storeSettings, clearAllTransactions } = useApp();

  // Custom modal trigger state
  const [deleteTrxId, setDeleteTrxId] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);

  // Multi-selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filters & State
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Selection toggles
  const isAllSelected = useMemo(() => {
    const list = transactions.filter((t) => {
      const matchSearch = t.id.toLowerCase().includes(search.toLowerCase()) || 
                          t.pelanggan.toLowerCase().includes(search.toLowerCase()) ||
                          t.metodePembayaran.toLowerCase().includes(search.toLowerCase());
      
      const matchDate = !dateFilter || t.tanggal.startsWith(dateFilter);
      return matchSearch && matchDate;
    });
    if (list.length === 0) return false;
    return list.every(t => selectedIds.includes(t.id));
  }, [transactions, search, dateFilter, selectedIds]);

  const handleSelectAllToggle = () => {
    const list = transactions.filter((t) => {
      const matchSearch = t.id.toLowerCase().includes(search.toLowerCase()) || 
                          t.pelanggan.toLowerCase().includes(search.toLowerCase()) ||
                          t.metodePembayaran.toLowerCase().includes(search.toLowerCase());
      
      const matchDate = !dateFilter || t.tanggal.startsWith(dateFilter);
      return matchSearch && matchDate;
    });

    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !list.some(t => t.id === id)));
    } else {
      setSelectedIds(prev => {
        const next = [...prev, ...list.map(t => t.id)];
        return Array.from(new Set(next));
      });
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = t.id.toLowerCase().includes(search.toLowerCase()) || 
                          t.pelanggan.toLowerCase().includes(search.toLowerCase()) ||
                          t.metodePembayaran.toLowerCase().includes(search.toLowerCase());
      
      const matchDate = !dateFilter || t.tanggal.startsWith(dateFilter);
      return matchSearch && matchDate;
    });
  }, [transactions, search, dateFilter]);

  const handleOpenDetail = (t: Transaction) => {
    setSelectedTrx(t);
    setIsDetailOpen(true);
  };

  const handleDeleteTrx = (id: string) => {
    setDeleteTrxId(id);
  };

  const getMethodIcon = (method: Transaction['metodePembayaran']) => {
    switch (method) {
      case 'Tunai': return <Coins className="h-4 w-4 text-amber-500" />;
      case 'QRIS': return <QrCode className="h-4 w-4 text-indigo-500" />;
      case 'Transfer': return <CreditCard className="h-4 w-4 text-emerald-500" />;
    }
  };

  // EXPORT RECEIPT PDF
  const downloadReceiptPDF = (trx: Transaction) => {
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 160]
    });

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
    
    doc.text(`No: ${trx.id}`, 5, 27);
    doc.text(`Tgl: ${new Date(trx.tanggal).toLocaleString('id-ID')}`, 5, 31);
    doc.text(`Kasir: Admin Toko`, 5, 35);
    doc.text(`Cust: ${trx.pelanggan}`, 5, 39);
    
    doc.text('--------------------------------------', 5, 43);
    
    let y = 47;
    trx.items.forEach(itm => {
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

    doc.save(`reprint_${trx.id}.pdf`);
    toast.success('Nota PDF berhasil dibuat!');
  };

  // EXPORT MULTIPLE RECEIPTS AS A COMPILED PDF
  const downloadBulkReceiptPDF = (trxIds: string[]) => {
    const listToPrint = transactions.filter(t => trxIds.includes(t.id));
    if (listToPrint.length === 0) {
      toast.error('Tidak ada transaksi yang dipilih untuk dicetak.');
      return;
    }

    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 160]
    });

    listToPrint.forEach((trx, index) => {
      if (index > 0) {
        doc.addPage([80, 160]);
      }

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
      
      doc.text(`No: ${trx.id}`, 5, 27);
      doc.text(`Tgl: ${new Date(trx.tanggal).toLocaleString('id-ID')}`, 5, 31);
      doc.text(`Kasir: Admin Toko`, 5, 35);
      doc.text(`Cust: ${trx.pelanggan}`, 5, 39);
      
      doc.text('--------------------------------------', 5, 43);
      
      let y = 47;
      trx.items.forEach(itm => {
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
    });

    doc.save(`bulk_receipts_${listToPrint.length}.pdf`);
    toast.success(`${listToPrint.length} Nota PDF berhasil dicetak dalam berkas gabungan!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header view */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider dark:text-zinc-400">Order Logs</p>
          <h2 className="text-2xl font-bold text-gray-950 dark:text-white mt-1">Riwayat Transaksi Penjualan</h2>
        </div>
        
        {transactions.length > 0 && (
          <button
            onClick={() => setShowClearAllConfirm(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all border border-rose-100 dark:bg-rose-950/15 dark:border-rose-950/25 dark:text-rose-400 dark:hover:bg-rose-950/30 shadow-xs cursor-pointer self-start md:self-auto"
          >
            <Trash2 className="h-4 w-4" /> Delete All
          </button>
        )}
      </div>

      {/* Controllers Search & Date */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex flex-col sm:flex-row gap-3 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari transaksi berdasarkan No. TRX, nama pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-zinc-400 focus:border-emerald-500"
          />
        </div>

        {/* Date Filter */}
        <div className="w-full sm:w-52 shrink-0 relative">
          <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="date"
            placeholder="Cari Tanggal"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 outline-none rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-gray-600 dark:text-zinc-300 cursor-pointer"
          />
        </div>

        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            className="px-3 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 text-xs font-bold shrink-0 transition-colors dark:bg-rose-950/20 dark:text-rose-450 cursor-pointer"
          >
            Bersihkan Tanggal
          </button>
        )}

      </div>

      {/* Bulk actions panel */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md dark:bg-emerald-950/20 dark:border-emerald-900/35 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 text-white p-1.5 rounded-lg flex items-center justify-center">
              <Printer className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {selectedIds.length} Transaksi Terpilih
              </p>
              <p className="text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400/80">
                Pilih cetak massal untuk menggabungkan semua nota ke dalam satu cetakan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadBulkReceiptPDF(selectedIds)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" /> Cetak Terpilih (Bulk Reprint)
            </button>
            <button
              onClick={() => setShowDeleteSelectedConfirm(true)}
              className="px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 dark:bg-rose-950/25 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="h-3.5 w-3.5" /> Hapus Terpilih
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* History table view lists */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 dark:bg-zinc-950/40 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-4 px-5 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected} 
                    onChange={handleSelectAllToggle}
                    className="rounded border-gray-300 dark:border-zinc-800 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-4 w-4" 
                  />
                </th>
                <th className="py-4 px-5">Kode Invoice</th>
                <th className="py-4 px-4">Waktu Transaksi</th>
                <th className="py-4 px-4">Pelanggan</th>
                <th className="py-4 px-4">Metode Bayar</th>
                <th className="py-4 px-4 text-right">Total Transaksi</th>
                <th className="py-4 px-5 text-center">Operasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-xs font-medium">
              
              {filteredTransactions.map((t) => (
                <tr 
                  key={t.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors animate-in fade-in duration-100"
                >
                  <td className="py-4.5 px-5 text-center w-12">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(t.id)} 
                      onChange={() => handleSelectOne(t.id)}
                      className="rounded border-gray-300 dark:border-zinc-800 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-4 w-4" 
                    />
                  </td>
                  <td className="py-4.5 px-5 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {t.id}
                  </td>
                  <td className="py-4.5 px-4 text-zinc-550 dark:text-zinc-400">
                    {new Date(t.tanggal).toLocaleString('id-ID', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-4.5 px-4 font-bold text-gray-900 dark:text-white truncate max-w-[140px]">
                    {t.pelanggan}
                  </td>
                  <td className="py-4.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/40 text-[10px] font-bold text-slate-700 dark:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300">
                      {getMethodIcon(t.metodePembayaran)}
                      {t.metodePembayaran}
                    </span>
                  </td>
                  <td className="py-4.5 px-4 text-right font-bold text-gray-950 dark:text-white font-mono">
                    Rp{t.total.toLocaleString('id-ID')}
                  </td>
                  <td className="py-4.5 px-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenDetail(t)}
                        className="p-1.5 border border-gray-200 dark:border-zinc-800 text-gray-600 hover:bg-slate-100 rounded-lg dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-[10px] font-bold cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" /> Detail
                      </button>
                      <button
                        onClick={() => handleDeleteTrx(t.id)}
                        className="p-1.5 border border-rose-100 dark:border-rose-950/20 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                        title="Batalkan Transaksi"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                   <td colSpan={7} className="py-12 text-center text-zinc-400">
                    Tidak ada riwayat transaksi penjualan.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* TRANSACTION INVOICE DETAILED VIEW SLIDEOVER MODAL */}
      {isDetailOpen && selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-120">
            
            <div className="px-5 py-4 bg-slate-50 border-b border-gray-100 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-gray-950 dark:text-white">
                  Rincian Penjualan #{selectedTrx.id}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedTrx(null);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content list */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[400px]">
              
              {/* Top metadata cards */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-gray-200 dark:bg-zinc-900/60 dark:border-zinc-800">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Pelanggan</span>
                  <p className="font-bold text-gray-800 dark:text-zinc-200">{selectedTrx.pelanggan}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Metode Pembayaran</span>
                  <p className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-1">
                    {getMethodIcon(selectedTrx.metodePembayaran)}
                    {selectedTrx.metodePembayaran}
                  </p>
                </div>
                <div className="space-y-1 mt-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Waktu Kejadian</span>
                  <p className="font-semibold text-gray-700 dark:text-zinc-300">
                    {new Date(selectedTrx.tanggal).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="space-y-1 mt-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Status Pembayaran</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Selesai & Lunas
                  </p>
                </div>
              </div>

              {/* Items listing table details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Item yang Dibeli</h4>
                <div className="divide-y divide-gray-100 dark:divide-zinc-800 font-mono text-xs">
                  {selectedTrx.items.map((itm) => (
                    <div key={itm.productId} className="py-2.5 flex justify-between items-center bg-slate-50/20 p-2 rounded-lg mb-1 dark:bg-zinc-900/20">
                      <div>
                        <p className="font-sans font-extrabold text-gray-900 dark:text-white leading-normal">{itm.nama}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{itm.qty} unit x Rp{itm.harga.toLocaleString('id-ID')}</p>
                      </div>
                      <span className="font-bold text-gray-955 dark:text-white">
                        Rp{itm.subtotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary calculations breakdown */}
              <div className="border-t border-dashed border-gray-200/80 pt-4.5 space-y-2 text-xs font-semibold pl-10 text-right">
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-bold">Subtotal:</span>
                  <span className="font-mono">Rp{selectedTrx.subtotal.toLocaleString('id-ID')}</span>
                </div>
                {selectedTrx.diskon > 0 && (
                  <div className="flex justify-between text-rose-500 font-semibold">
                    <span>Diskon Potongan:</span>
                    <span className="font-mono">-Rp{selectedTrx.diskon.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-bold">Pajak (PPN):</span>
                  <span className="font-mono">Rp{selectedTrx.pajak.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between text-base font-extrabold text-gray-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    Rp{selectedTrx.total.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400 border-t border-gray-100 pt-2.5 font-bold">
                  <span>Tunai Dibayar:</span>
                  <span className="font-mono">Rp{selectedTrx.uangDibayar.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400 border-t border-gray-100 pt-2.5 font-extrabold">
                  <span>Uang Kembalian:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">Rp{selectedTrx.kembalian.toLocaleString('id-ID')}</span>
                </div>
              </div>

            </div>

            {/* Reprint actions block */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 flex gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => downloadReceiptPDF(selectedTrx)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-250 dark:border-zinc-800 text-gray-700 bg-white dark:bg-zinc-950 dark:text-zinc-200 hover:bg-gray-100 rounded-xl font-bold cursor-pointer"
              >
                <Download className="h-4 w-4" /> Cetak PDF (Re-print)
              </button>
              
              <button
                type="button"
                onClick={() => handleDeleteTrx(selectedTrx.id)}
                className="px-3 py-2 border border-rose-100 dark:border-rose-955/20 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl font-bold cursor-pointer flex items-center gap-1 shrink-0 text-xs"
              >
                <RotateCcw className="h-4 w-4" /> Batalkan Nota
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Cancel/Delete Single Transaction */}
      <ConfirmModal
        isOpen={deleteTrxId !== null}
        onClose={() => setDeleteTrxId(null)}
        onConfirm={() => {
          if (deleteTrxId) {
            deleteTransaction(deleteTrxId);
            toast.success(`Transaksi "${deleteTrxId}" berhasil dibatalkan dan stok dikembalikan!`);
            if (selectedTrx?.id === deleteTrxId) {
              setIsDetailOpen(false);
            }
            setSelectedIds(prev => prev.filter(x => x !== deleteTrxId));
            setDeleteTrxId(null);
          }
        }}
        title="Batalkan Transaksi?"
        message={`Apakah Anda yakin ingin MEMBATALKAN / MENGHAPUS Transaksi "${deleteTrxId}"? Tindakan ini akan mengembalikan stok produk yang terjual ke inventaris.`}
        confirmText="Hapus/Batal"
        cancelText="Simpan"
        confirmStyle="rose"
        isWarning={true}
      />

      {/* MODAL: Clear All Transactions */}
      <ConfirmModal
        isOpen={showClearAllConfirm}
        onClose={() => setShowClearAllConfirm(false)}
        onConfirm={() => {
          clearAllTransactions();
          setSelectedIds([]);
          toast.success('Seluruh riwayat transaksi penjualan berhasil dikosongkan!');
          setIsDetailOpen(false);
          setSelectedTrx(null);
          setShowClearAllConfirm(false);
        }}
        title="Hapus Semua Riwayat?"
        message="Apakah Anda yakin ingin menghapus SELURUH catatan riwayat penjualan di sistem? Tindakan ini bersifat permanen dan tidak dapat dikembalikan."
        confirmText="Hapus Semua"
        cancelText="Batal"
        confirmStyle="rose"
        isWarning={true}
      />

      {/* MODAL: Delete Selected Transactions */}
      <ConfirmModal
        isOpen={showDeleteSelectedConfirm}
        onClose={() => setShowDeleteSelectedConfirm(false)}
        onConfirm={() => {
          selectedIds.forEach(id => {
            deleteTransaction(id);
          });
          toast.success(`${selectedIds.length} transaksi terpilih berhasil dihapus dari sistem!`);
          setSelectedIds([]);
          setShowDeleteSelectedConfirm(false);
        }}
        title="Hapus Transaksi Terpilih?"
        message={`Apakah Anda yakin ingin menghapus ${selectedIds.length} transaksi yang sedang Anda pilih? Stok produk yang bersangkutan akan dikembalikan.`}
        confirmText="Hapus"
        cancelText="Batal"
        confirmStyle="rose"
        isWarning={true}
      />

    </div>
  );
};
