export interface Product {
  id: string;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  barcode: string;
  gambar: string; // Base64 data-uri or image URL
  createdAt: string;
}

export interface Category {
  id: string;
  nama: string;
}

export interface CartItem {
  productId: string;
  nama: string;
  harga: number;
  qty: number;
  subtotal: number;
}

export interface Transaction {
  id: string; // format TRX-YYYYMMDD-XXXX
  tanggal: string; // ISO String or YYYY-MM-DDTHH:mm:SS
  pelanggan: string;
  subtotal: number;
  diskon: number; // percentage or direct nominal (we can do a percentage or nominal, nominal is easier and standard)
  pajak: number; // percentage (e.g., 11% or nominal, let's support percentage)
  total: number;
  metodePembayaran: 'Tunai' | 'QRIS' | 'Transfer';
  items: CartItem[];
  uangDibayar: number;
  kembalian: number;
}

export interface StoreSettings {
  namaToko: string;
  alamat: string;
  telepon: string;
  logo: string;
  nmid?: string;
  merchantId?: string;
  kota?: string;
  kodePos?: string;
  rawQrisPayload?: string;
}

export type Theme = 'light' | 'dark';
