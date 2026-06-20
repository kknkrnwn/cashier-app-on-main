import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  BarChart3, 
  LineChart as LineIcon,
  PieChart as PieIcon,
  CalendarDays, 
  TrendingUp, 
  FileSpreadsheet, 
  FileText, 
  Download,
  BookOpenCheck,
  Building,
  Edit,
  Trash2,
  X,
  CreditCard,
  Coins,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../components/ConfirmModal';

export const Laporan: React.FC = () => {
  const { transactions, categories, storeSettings, deleteTransaction, updateTransaction } = useApp();
  
  // Tab states: 'harian' | 'bulanan' | 'tahunan'
  const [activeRange, setActiveRange] = useState<'harian' | 'bulanan' | 'tahunan'>('harian');

  // Redux journal editing states
  const [editingTrx, setEditingTrx] = useState<Transaction | null>(null);
  const [editPelanggan, setEditPelanggan] = useState('');
  const [editMetode, setEditMetode] = useState<'Tunai' | 'QRIS' | 'Transfer'>('Tunai');
  const [editTanggal, setEditTanggal] = useState('');
  const [editDiskon, setEditDiskon] = useState(0);
  const [editPajak, setEditPajak] = useState(0);
  const [editUangDibayar, setEditUangDibayar] = useState(0);

  const [deleteTrxId, setDeleteTrxId] = useState<string | null>(null);

  const handleStartEdit = (t: Transaction) => {
    setEditingTrx(t);
    setEditPelanggan(t.pelanggan);
    setEditMetode(t.metodePembayaran);
    
    // Format date string for the datetime-local input
    try {
      const dateObj = new Date(t.tanggal);
      const tzOffset = dateObj.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(dateObj.getTime() - tzOffset)).toISOString().slice(0, 16);
      setEditTanggal(localISOTime);
    } catch {
      setEditTanggal('');
    }
    setEditDiskon(t.diskon);
    setEditPajak(t.pajak);
    setEditUangDibayar(t.uangDibayar);
  };

  const handleSaveEdit = () => {
    if (!editingTrx) return;
    
    let isoDateString = editingTrx.tanggal;
    if (editTanggal) {
      isoDateString = new Date(editTanggal).toISOString();
    }

    updateTransaction(editingTrx.id, {
      pelanggan: editPelanggan.trim() || 'Umum (Walk-in)',
      metodePembayaran: editMetode,
      tanggal: isoDateString,
      diskon: Number(editDiskon) || 0,
      pajak: Number(editPajak) || 0,
      uangDibayar: Number(editUangDibayar) || 0
    });

    toast.success(`Transaksi #${editingTrx.id} berhasil diperbarui!`);
    setEditingTrx(null);
  };

  const todayStr = '2026-06-18'; // Simulated Today date

  // 1. CALCULATE REVENUE STATS BY RANGES
  // A. HARIAN (Today)
  const statsHarian = useMemo(() => {
    const trxToday = transactions.filter(t => t.tanggal.startsWith(todayStr));
    const revenue = trxToday.reduce((sum, t) => sum + t.total, 0);
    const count = trxToday.length;
    
    // Average purchase size
    const avgTicket = count > 0 ? Math.round(revenue / count) : 0;
    
    // Payment method breakdown
    const methods: Record<string, number> = { Tunai: 0, QRIS: 0, Transfer: 0 };
    trxToday.forEach(t => { methods[t.metodePembayaran] += t.total; });

    return { revenue, count, avgTicket, methods };
  }, [transactions]);

  // B. BULANAN (June 2026)
  const statsBulanan = useMemo(() => {
    const junePrefix = '2026-06';
    const trxMonth = transactions.filter(t => t.tanggal.startsWith(junePrefix));
    const revenue = trxMonth.reduce((sum, t) => sum + t.total, 0);
    const count = trxMonth.length;
    const avgTicket = count > 0 ? Math.round(revenue / count) : 0;

    const methods: Record<string, number> = { Tunai: 0, QRIS: 0, Transfer: 0 };
    trxMonth.forEach(t => { methods[t.metodePembayaran] += t.total; });

    return { revenue, count, avgTicket, methods };
  }, [transactions]);

  // C. TAHUNAN (Year 2026)
  const statsTahunan = useMemo(() => {
    const yearPrefix = '2026';
    const trxYear = transactions.filter(t => t.tanggal.startsWith(yearPrefix));
    const revenue = trxYear.reduce((sum, t) => sum + t.total, 0);
    const count = trxYear.length;
    const avgTicket = count > 0 ? Math.round(revenue / count) : 0;

    const methods: Record<string, number> = { Tunai: 0, QRIS: 0, Transfer: 0 };
    trxYear.forEach(t => { methods[t.metodePembayaran] += t.total; });

    return { revenue, count, avgTicket, methods };
  }, [transactions]);

  // EXCEL SPREADSHEET EXPORTER
  const exportToExcel = () => {
    try {
      // Structure transaction rows
      const rows = transactions.map((t, idx) => ({
        'No.': idx + 1,
        'ID Transaksi': t.id,
        'Waktu Tanggal': new Date(t.tanggal).toLocaleString('id-ID'),
        'Nama Pelanggan': t.pelanggan,
        'Metode Pembayaran': t.metodePembayaran,
        'Subtotal (Rp)': t.subtotal,
        'Diskon (Rp)': t.diskon,
        'Pajak (Rp)': t.pajak,
        'Total Bersih (Rp)': t.total,
        'Jumlah Qty Barang': t.items.reduce((s, i) => s + i.qty, 0)
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Penjualan');

      // Add summary sheet metadata too
      const summaryInfo = [
        { 'Metrik Bisnis': 'Nama Toko', 'Nilai': storeSettings.namaToko },
        { 'Metrik Bisnis': 'Ekspor Tanggal', 'Nilai': new Date().toLocaleString('id-ID') },
        { 'Metrik Bisnis': 'Total Semua Omzet', 'Nilai': transactions.reduce((s, t) => s + t.total, 0) },
        { 'Metrik Bisnis': 'Total Buku Transaksi', 'Nilai': transactions.length }
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryInfo);
      XLSX.utils.book_append_sheet(workbook, wsSummary, 'Ringkasan Eksekutif');

      XLSX.writeFile(workbook, `laporan_penjualan_pos_${todayStr}.xlsx`);
      toast.success('Laporan penjualan berhasil diekspor ke format Excel!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengekspor data Excel. Sediakan data transaksi yang valid.');
    }
  };

  // FINANCIAL AUDIT REPORT PDF
  const exportToPDFReport = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4'); // Standard clean A4 paper size

      // Header Banner
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(5, 150, 105); // Emerald Green color theme
      doc.text(storeSettings.namaToko || 'CepatSaji Kasir', 14, 20);
      
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(110, 110, 110);
      doc.text(storeSettings.alamat || 'Alamat Toko', 14, 25);
      doc.text(`Telepon: ${storeSettings.telepon || '021-X'}  |  Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 29);
      
      // Horizontal Line Divider
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.5);
      doc.line(14, 33, 196, 33);
      
      // Report Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text('LAPORAN JURNAL TRANSAKSI PENJUALAN', 14, 42);

      // Financial Metrics box summaries
      doc.setDrawColor(230, 230, 230);
      doc.setFillColor(248, 250, 252); // soft slate bg 50
      doc.rect(14, 46, 182, 22, 'FD');

      const totalRevenueAll = transactions.reduce((s, t) => s + t.total, 0);
      const totalTaxCollected = transactions.reduce((s, t) => s + t.pajak, 0);
      const totalDiscountsGiven = transactions.reduce((s, t) => s + t.diskon, 0);

      doc.setFontSize(9);
      doc.setFont('Helvetica', 'bold');
      doc.text('Ringkasan Kumulatif:', 18, 51);
      
      doc.setFont('Helvetica', 'normal');
      doc.text(`Total Pemasukan Omzet : Rp${totalRevenueAll.toLocaleString('id-ID')}`, 18, 56);
      doc.text(`Jumlah Bukti Nota    : ${transactions.length} Transaksi`, 18, 61);
      
      doc.text(`Potongan Diskon : Rp${totalDiscountsGiven.toLocaleString('id-ID')}`, 105, 56);
      doc.text(`Total Pajak PPN  : Rp${totalTaxCollected.toLocaleString('id-ID')}`, 105, 61);

      // Table Header of Journals
      let y = 78;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 8, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text('ID Transaksi', 17, y + 5.5);
      doc.text('Tanggal', 52, y + 5.5);
      doc.text('Nama Pelanggan', 90, y + 5.5);
      doc.text('Metode', 140, y + 5.5);
      doc.text('Total Bersih', 170, y + 5.5);

      y += 8;

      // Table Row listings loop
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);

      transactions.slice(0, 18).forEach((t) => { // Maximum list limit for page fitting budget
        if (y > 250) return; // simple page budgeting overflow guard
        
        doc.line(14, y, 196, y); // Row bottom border
        doc.text(t.id, 17, y + 5);
        doc.text(new Date(t.tanggal).toLocaleDateString('id-ID'), 52, y + 5);
        
        const custName = t.pelanggan.length > 22 ? t.pelanggan.slice(0, 20) + '..' : t.pelanggan;
        doc.text(custName, 90, y + 5);
        doc.text(t.metodePembayaran, 140, y + 5);
        
        const totalText = `Rp${t.total.toLocaleString('id-ID')}`;
        doc.text(totalText, 170, y + 5);
        y += 7.5;
      });

      doc.line(14, y, 196, y);

      // Footer disclaimer & signature
      y += 18;
      if (y < 275) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text('Mengetahui & Disahkan oleh,', 145, y);
        doc.text('Manajer Keuangan Toko', 145, y + 16);
        doc.line(145, y + 15, 190, y + 15);
      }

      doc.save(`laporan_keuangan_pos_${todayStr}.pdf`);
      toast.success('Laporan Keuangan Audit PDF diunduh sukses!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal membukukan ekspor PDF.');
    }
  };

  // Helper selectors
  const activeStats = () => {
    switch (activeRange) {
      case 'harian': return statsHarian;
      case 'bulanan': return statsBulanan;
      case 'tahunan': return statsTahunan;
    }
  };

  const getMethodsChartData = () => {
    const stats = activeStats();
    return [
      { name: 'Tunai', Nilai: stats.methods.Tunai, fill: '#f59e0b' },
      { name: 'QRIS', Nilai: stats.methods.QRIS, fill: '#6366f1' },
      { name: 'Transfer', Nilai: stats.methods.Transfer, fill: '#10b981' }
    ];
  };

  const chartColors = ['#f59e0b', '#6366f1', '#10b981'];

  return (
    <div className="space-y-6">
      
      {/* Upper header section with exporters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider dark:text-zinc-400">Financial Reports</p>
          <h2 className="text-2xl font-bold text-gray-950 dark:text-white mt-1">Laporan Omzet & Buku Jurnal</h2>
        </div>
        
        {/* Export Triggers */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 rounded-xl dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Ekspor ke Excel
          </button>
          
          <button
            onClick={exportToPDFReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            Cetak Jurnal PDF
          </button>
        </div>
      </div>

      {/* Selector switches daily vs monthly vs yearly */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex flex-col md:flex-row shadow-sm dark:bg-zinc-900 dark:border-zinc-800 justify-between items-center gap-4">
        
        <div className="flex bg-slate-100 dark:bg-zinc-805/60 dark:bg-zinc-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveRange('harian')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeRange === 'harian'
                ? 'bg-white dark:bg-zinc-900 text-gray-950 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Laporan Harian
          </button>
          <button
            onClick={() => setActiveRange('bulanan')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeRange === 'bulanan'
                ? 'bg-white dark:bg-zinc-900 text-gray-950 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Laporan Bulanan
          </button>
          <button
            onClick={() => setActiveRange('tahunan')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeRange === 'tahunan'
                ? 'bg-white dark:bg-zinc-900 text-gray-950 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Laporan Tahunan
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 rounded-full text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
          <CalendarDays className="h-3.5 w-3.5" />
          Metode Sinkronisasi Local Storage Terbaca Otomatis
        </div>
      </div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Metric 1 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">TOTAL OMZET MASUK</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-3.5">
            Rp{activeStats().revenue.toLocaleString('id-ID')}
          </h3>
          <p className="text-[10px] text-zinc-400 mt-1">Dihitung secara akumulatif bersih</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">BUKU NOTA PENJUALAN</p>
          <h3 className="text-2xl font-extrabold text-gray-950 dark:text-white font-mono mt-3.5">
            {activeStats().count} Transaksi
          </h3>
          <p className="text-[10px] text-zinc-400 mt-1">Struk nota tercetak divalidasi</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">NILAI RATA-RATA ORDER</p>
          <h3 className="text-2xl font-extrabold text-gray-950 dark:text-white font-mono mt-3.5">
            Rp{activeStats().avgTicket.toLocaleString('id-ID')}
          </h3>
          <p className="text-[10px] text-zinc-400 mt-1">Perolehan rata-rata per pelanggan</p>
        </div>

      </div>

      {/* Analytical Diagrams Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left side: payment share distribution (Span 2) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-950 dark:text-white uppercase tracking-wide">Porsi Metode Pembayaran</h3>
            <p className="text-xs text-zinc-400 mt-1">Kontribusi masing-masing kanal nominal rupiah</p>

            <div className="h-44 w-full flex items-center justify-center relative my-4">
              {activeStats().revenue > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(val: any) => [`Rp${val.toLocaleString('id-ID')}`, 'Nominal Omzet']} />
                    <Pie
                      data={getMethodsChartData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="Nilai"
                    >
                      {getMethodsChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-zinc-400 text-xs">Pencatatan nominal masih kosong.</div>
              )}
            </div>
          </div>

          <div className="space-y-2 mt-2">
            {getMethodsChartData().map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-gray-650 dark:text-zinc-300">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }}></div>
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold font-mono text-gray-900 dark:text-white">
                  Rp{item.Nilai.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: bar representation (Span 3) */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-950 dark:text-white uppercase tracking-wide">Diagram Nominal Pembayaran</h3>
              <p className="text-xs text-zinc-400 mt-1">Grafik perbandingan volume keuangan</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getMethodsChartData()}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${v/1000}k`} />
                <Tooltip formatter={(value: any) => [`Rp${value.toLocaleString()}`, 'Total']} />
                <Bar dataKey="Nilai" radius={[6, 6, 0, 0]}>
                  {getMethodsChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Jurnal Transaksi & Riwayat Editor */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-805/40 mt-6">
        <div className="p-5 border-b border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-950/20">
          <div>
            <h3 className="text-sm font-bold text-gray-950 dark:text-white uppercase tracking-wide">Penyuntingan Jurnal & Riwayat</h3>
            <p className="text-xs text-zinc-400 mt-1">Ubah atau hapus transaksi secara langsung dari panel pembukuan laporan.</p>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1 rounded-md font-bold font-mono">
            TOTAL DATA: {transactions.length} UNIT
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 dark:bg-zinc-950/40 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-4 px-5">Kode Invoice</th>
                <th className="py-4 px-4">Waktu Transaksi</th>
                <th className="py-4 px-4">Pelanggan</th>
                <th className="py-4 px-4">Metode Bayar</th>
                <th className="py-4 px-4 text-right">Potongan Diskon</th>
                <th className="py-4 px-4 text-right">Pajak (PPN)</th>
                <th className="py-4 px-4 text-right">Total Akhir</th>
                <th className="py-4 px-5 text-center">Tindakan Redaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-xs font-medium">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {t.id}
                  </td>
                  <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400">
                    {new Date(t.tanggal).toLocaleString('id-ID', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-4 px-4 font-bold text-gray-900 dark:text-white truncate max-w-[120px]">
                    {t.pelanggan}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/40 text-[10px] font-bold text-slate-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
                      {t.metodePembayaran}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-rose-500 font-mono">
                    Rp{t.diskon.toLocaleString('id-ID')}
                  </td>
                  <td className="py-4 px-4 text-right text-indigo-500 font-mono">
                    Rp{t.pajak.toLocaleString('id-ID')}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-gray-955 dark:text-white font-mono">
                    Rp{t.total.toLocaleString('id-ID')}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleStartEdit(t)}
                        className="p-1 px-2.5 border border-gray-200 dark:border-zinc-800 text-gray-650 bg-white dark:bg-zinc-950 dark:text-zinc-300 hover:bg-slate-100 rounded-lg dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-[10px] font-bold cursor-pointer"
                        title="Ubah Transaksi"
                      >
                        <Edit className="h-3.5 w-3.5 text-blue-500" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteTrxId(t.id)}
                        className="p-1.5 border border-rose-100 dark:border-rose-950/25 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    Tidak ada riwayat penjualan yang dapat diubah atau dihapus.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL DIALOG OVERLAY */}
      {editingTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-120">
            
            <div className="px-5 py-4 bg-slate-50 border-b border-gray-100 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-gray-950 dark:text-white flex items-center gap-2">
                <Edit className="h-4.5 w-4.5 text-blue-500" />
                Edit Transaksi #{editingTrx.id}
              </h3>
              <button
                onClick={() => setEditingTrx(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-805 rounded-lg text-gray-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-semibold">
              
              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="text-zinc-500 dark:text-zinc-400 font-bold">Nama Pelanggan / Customer</label>
                <input
                  type="text"
                  value={editPelanggan}
                  onChange={(e) => setEditPelanggan(e.target.value)}
                  placeholder="Nama Pelanggan"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none text-gray-900 dark:text-white font-medium focus:border-blue-500"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-zinc-500 dark:text-zinc-400 font-bold">Metode Pembayaran</label>
                <select
                  value={editMetode}
                  onChange={(e) => setEditMetode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none text-gray-900 dark:text-white font-semibold focus:border-blue-500 cursor-pointer"
                >
                  <option value="Tunai">Tunai / Cash</option>
                  <option value="QRIS">QRIS / E-Wallet</option>
                  <option value="Transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Log Date time */}
              <div className="space-y-1.5">
                <label className="text-zinc-500 dark:text-zinc-400 font-bold">Waktu & Tanggal Transaksi</label>
                <input
                  type="datetime-local"
                  value={editTanggal}
                  onChange={(e) => setEditTanggal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none text-gray-900 dark:text-white font-medium focus:border-blue-500 cursor-pointer"
                />
              </div>

              {/* Price elements side-by-side */}
              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-zinc-500 dark:text-zinc-400 font-bold">Nominal Diskon (Rp)</label>
                  <input
                    type="number"
                    value={editDiskon}
                    onChange={(e) => setEditDiskon(Number(e.target.value) || 0)}
                    min={0}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none text-gray-900 dark:text-white font-medium font-mono focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-500 dark:text-zinc-400 font-bold">Nominal Pajak PPN (Rp)</label>
                  <input
                    type="number"
                    value={editPajak}
                    onChange={(e) => setEditPajak(Number(e.target.value) || 0)}
                    min={0}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none text-gray-900 dark:text-white font-medium font-mono focus:border-blue-500"
                  />
                </div>

              </div>

              {/* Tunai Dibayar */}
              <div className="space-y-1.5">
                <label className="text-zinc-500 dark:text-zinc-400 font-bold">Jumlah Tunai Dibayar/Uang (Rp)</label>
                <input
                  type="number"
                  value={editUangDibayar}
                  onChange={(e) => setEditUangDibayar(Number(e.target.value) || 0)}
                  min={0}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none text-gray-900 dark:text-white font-medium font-mono focus:border-blue-500"
                />
              </div>

              <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 text-[10px] text-zinc-500 leading-relaxed font-semibold">
                ⚠️ Catatan: Subtotal barang ({editingTrx.items.reduce((s,i) => s + i.qty, 0)} item) berharga dasar Rp{editingTrx.subtotal.toLocaleString('id-ID')}. Nilai total baru dihitung: Subtotal - Diskon + Pajak.
              </div>

            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 flex gap-2.5">
              <button
                type="button"
                onClick={() => setEditingTrx(null)}
                className="flex-1 py-2 bg-white border border-gray-300 dark:bg-zinc-805 dark:border-zinc-800 hover:bg-gray-100 rounded-xl font-bold dark:text-white text-gray-700 cursor-pointer text-xs"
              >
                Batal
              </button>
              
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-md shadow-blue-500/10 rounded-xl cursor-pointer text-xs"
              >
                Simpan Perubahan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: DELETE TRANSACTION */}
      <ConfirmModal
        isOpen={deleteTrxId !== null}
        onClose={() => setDeleteTrxId(null)}
        onConfirm={() => {
          if (deleteTrxId) {
            deleteTransaction(deleteTrxId);
            toast.success(`Transaksi "${deleteTrxId}" berhasil dihapus, stok dikembalikan!`);
            setDeleteTrxId(null);
          }
        }}
        title="Hapus Transaksi Buku?"
        message={`Apakah Anda yakin ingin MENGHAPUS / MEMBATALKAN Transaksi "${deleteTrxId}" pada pembukuan? Tindakan ini akan mengembalikan stok produk ke persediaan.`}
        confirmText="Hapus Permanen"
        cancelText="Simpan"
        confirmStyle="rose"
        isWarning={true}
      />

    </div>
  );
};
