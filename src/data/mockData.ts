import { Product, Category, Transaction, StoreSettings } from '../types';

export const initialCategories: Category[] = [
  { id: 'cat-1', nama: '☕ ESPRESSO BASED' },
  { id: 'cat-2', nama: '🧊 ICED SPECIALS' },
  { id: 'cat-3', nama: '🍵 NON COFFEE' },
  { id: 'cat-4', nama: '🍹 SIGNATURE DRINKS' },
  { id: 'cat-5', nama: '🍵 TEA SERIES' },
  { id: 'cat-6', nama: '🧊 FRAPPE / BLENDED' },
  { id: 'cat-7', nama: '🍰 SNACKS & DESSERT' },
  { id: 'cat-8', nama: '🥤 FRESH DRINKS' },
  { id: 'cat-9', nama: '✨ ADD ONS' }
];

export const initialProducts: Product[] = [
  // ☕ ESPRESSO BASED
  { id: 'prod-1', nama: 'Americano', kategori: '☕ ESPRESSO BASED', harga: 18000, stok: 45, barcode: 'ESP-001', gambar: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-10T10:00:00.000Z' },
  { id: 'prod-2', nama: 'Espresso', kategori: '☕ ESPRESSO BASED', harga: 15000, stok: 50, barcode: 'ESP-002', gambar: 'https://images.unsplash.com/photo-1579888944880-d98341148722?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-10T10:15:00.000Z' },
  { id: 'prod-3', nama: 'Double Espresso', kategori: '☕ ESPRESSO BASED', harga: 20000, stok: 40, barcode: 'ESP-003', gambar: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-10T10:30:00.000Z' },
  { id: 'prod-4', nama: 'Latte', kategori: '☕ ESPRESSO BASED', harga: 22000, stok: 35, barcode: 'ESP-004', gambar: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-10T10:45:00.000Z' },
  { id: 'prod-5', nama: 'Cappuccino', kategori: '☕ ESPRESSO BASED', harga: 22000, stok: 35, barcode: 'ESP-005', gambar: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-10T11:00:00.000Z' },
  { id: 'prod-6', nama: 'Flat White', kategori: '☕ ESPRESSO BASED', harga: 23000, stok: 30, barcode: 'ESP-006', gambar: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-10T11:15:00.000Z' },
  { id: 'prod-7', nama: 'Mocha', kategori: '☕ ESPRESSO BASED', harga: 25000, stok: 25, barcode: 'ESP-007', gambar: 'https://images.unsplash.com/photo-1607681034540-2c46cc71896d?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-10T11:30:00.000Z' },
  { id: 'prod-8', nama: 'Caramel Latte', kategori: '☕ ESPRESSO BASED', harga: 25000, stok: 25, barcode: 'ESP-008', gambar: 'https://images.unsplash.com/photo-1595434066389-0cf5da747fb3?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-10T11:45:00.000Z' },
  { id: 'prod-9', nama: 'Vanilla Latte', kategori: '☕ ESPRESSO BASED', harga: 25000, stok: 25, barcode: 'ESP-009', gambar: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-10T12:00:00.000Z' },
  { id: 'prod-10', nama: 'Hazelnut Latte', kategori: '☕ ESPRESSO BASED', harga: 26000, stok: 25, barcode: 'ESP-010', gambar: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-10T12:15:00.000Z' },
  { id: 'prod-11', nama: 'Macchiato', kategori: '☕ ESPRESSO BASED', harga: 20000, stok: 25, barcode: 'ESP-011', gambar: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-10T12:30:00.000Z' },

  // 🧊 ICED SPECIALS
  { id: 'prod-12', nama: 'Iced Americano', kategori: '🧊 ICED SPECIALS', harga: 18000, stok: 45, barcode: 'ICE-001', gambar: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-11T10:00:00.000Z' },
  { id: 'prod-13', nama: 'Iced Latte', kategori: '🧊 ICED SPECIALS', harga: 23000, stok: 40, barcode: 'ICE-002', gambar: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-11T10:15:00.000Z' },
  { id: 'prod-14', nama: 'Iced Cappuccino', kategori: '🧊 ICED SPECIALS', harga: 23000, stok: 40, barcode: 'ICE-003', gambar: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-11T10:30:00.000Z' },
  { id: 'prod-15', nama: 'Brown Sugar Coffee', kategori: '🧊 ICED SPECIALS', harga: 25000, stok: 35, barcode: 'ICE-004', gambar: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-11T10:45:00.000Z' },
  { id: 'prod-16', nama: 'Iced Caramel Latte', kategori: '🧊 ICED SPECIALS', harga: 26000, stok: 30, barcode: 'ICE-005', gambar: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-11T11:00:00.000Z' },
  { id: 'prod-17', nama: 'Iced Vanilla Latte', kategori: '🧊 ICED SPECIALS', harga: 26000, stok: 30, barcode: 'ICE-006', gambar: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-11T11:15:00.000Z' },
  { id: 'prod-18', nama: 'Coffee Jelly Latte', kategori: '🧊 ICED SPECIALS', harga: 27000, stok: 25, barcode: 'ICE-007', gambar: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-11T11:30:00.000Z' },

  // 🍵 NON COFFEE
  { id: 'prod-19', nama: 'Matcha Latte', kategori: '🍵 NON COFFEE', harga: 25000, stok: 35, barcode: 'NCO-001', gambar: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-12T10:00:00.000Z' },
  { id: 'prod-20', nama: 'Chocolate', kategori: '🍵 NON COFFEE', harga: 22000, stok: 40, barcode: 'NCO-002', gambar: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-12T10:15:00.000Z' },
  { id: 'prod-21', nama: 'Dark Chocolate', kategori: '🍵 NON COFFEE', harga: 24000, stok: 35, barcode: 'NCO-003', gambar: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-12T10:30:00.000Z' },
  { id: 'prod-22', nama: 'Taro Latte', kategori: '🍵 NON COFFEE', harga: 24000, stok: 30, barcode: 'NCO-004', gambar: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-12T10:45:00.000Z' },
  { id: 'prod-23', nama: 'Red Velvet Latte', kategori: '🍵 NON COFFEE', harga: 24000, stok: 30, barcode: 'NCO-005', gambar: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-12T11:00:00.000Z' },
  { id: 'prod-24', nama: 'Fresh Milk', kategori: '🍵 NON COFFEE', harga: 18000, stok: 35, barcode: 'NCO-006', gambar: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-12T11:15:00.000Z' },
  { id: 'prod-25', nama: 'Strawberry Milk', kategori: '🍵 NON COFFEE', harga: 20000, stok: 25, barcode: 'NCO-007', gambar: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-12T11:30:00.000Z' },
  { id: 'prod-26', nama: 'Mango Milk', kategori: '🍵 NON COFFEE', harga: 20000, stok: 25, barcode: 'NCO-008', gambar: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-12T11:45:00.000Z' },

  // 🍹 SIGNATURE DRINKS
  { id: 'prod-27', nama: 'Aren Latte (Palm Sugar)', kategori: '🍹 SIGNATURE DRINKS', harga: 25000, stok: 45, barcode: 'SIG-001', gambar: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-13T10:00:00.000Z' },
  { id: 'prod-28', nama: 'Vietnam Drip Coffee', kategori: '🍹 SIGNATURE DRINKS', harga: 26000, stok: 30, barcode: 'SIG-002', gambar: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-13T10:15:00.000Z' },
  { id: 'prod-29', nama: 'Sea Salt Coffee', kategori: '🍹 SIGNATURE DRINKS', harga: 27000, stok: 30, barcode: 'SIG-003', gambar: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-13T10:30:00.000Z' },
  { id: 'prod-30', nama: 'Dirty Coffee', kategori: '🍹 SIGNATURE DRINKS', harga: 28000, stok: 25, barcode: 'SIG-004', gambar: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-13T10:45:00.000Z' },
  { id: 'prod-31', nama: 'Butterscotch Coffee', kategori: '🍹 SIGNATURE DRINKS', harga: 28000, stok: 25, barcode: 'SIG-005', gambar: 'https://images.unsplash.com/photo-1595434066389-0cf5da747fb3?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-13T11:00:00.000Z' },
  { id: 'prod-32', nama: 'Coconut Coffee', kategori: '🍹 SIGNATURE DRINKS', harga: 27000, stok: 20, barcode: 'SIG-006', gambar: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-13T11:15:00.000Z' },

  // 🍵 TEA SERIES
  { id: 'prod-33', nama: 'English Breakfast Tea', kategori: '🍵 TEA SERIES', harga: 18000, stok: 40, barcode: 'TEA-001', gambar: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-14T10:00:00.000Z' },
  { id: 'prod-34', nama: 'Green Tea', kategori: '🍵 TEA SERIES', harga: 18000, stok: 40, barcode: 'TEA-002', gambar: 'https://images.unsplash.com/photo-1564890369478-c90ae83ab9af?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-14T10:15:00.000Z' },
  { id: 'prod-35', nama: 'Earl Grey Tea', kategori: '🍵 TEA SERIES', harga: 18000, stok: 40, barcode: 'TEA-003', gambar: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-14T10:30:00.000Z' },
  { id: 'prod-36', nama: 'Lemon Tea', kategori: '🍵 TEA SERIES', harga: 20000, stok: 45, barcode: 'TEA-004', gambar: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-14T10:45:00.000Z' },
  { id: 'prod-37', nama: 'Peach Tea', kategori: '🍵 TEA SERIES', harga: 20000, stok: 35, barcode: 'TEA-005', gambar: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-14T11:00:00.000Z' },
  { id: 'prod-38', nama: 'Lychee Tea', kategori: '🍵 TEA SERIES', harga: 20000, stok: 35, barcode: 'TEA-006', gambar: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-14T11:15:00.000Z' },
  { id: 'prod-39', nama: 'Milk Tea', kategori: '🍵 TEA SERIES', harga: 22000, stok: 35, barcode: 'TEA-007', gambar: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-14T11:30:00.000Z' },
  { id: 'prod-40', nama: 'Brown Sugar Milk Tea', kategori: '🍵 TEA SERIES', harga: 24000, stok: 30, barcode: 'TEA-008', gambar: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-14T11:45:00.000Z' },

  // 🧊 FRAPPE / BLENDED
  { id: 'prod-41', nama: 'Mocha Frappe', kategori: '🧊 FRAPPE / BLENDED', harga: 28000, stok: 25, barcode: 'FRP-001', gambar: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-15T10:00:00.000Z' },
  { id: 'prod-42', nama: 'Chocolate Frappe', kategori: '🧊 FRAPPE / BLENDED', harga: 28000, stok: 25, barcode: 'FRP-002', gambar: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-15T10:15:00.000Z' },
  { id: 'prod-43', nama: 'Caramel Frappe', kategori: '🧊 FRAPPE / BLENDED', harga: 29000, stok: 20, barcode: 'FRP-003', gambar: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-15T10:30:00.000Z' },
  { id: 'prod-44', nama: 'Matcha Frappe', kategori: '🧊 FRAPPE / BLENDED', harga: 29000, stok: 20, barcode: 'FRP-004', gambar: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-15T10:45:00.000Z' },
  { id: 'prod-45', nama: 'Oreo Frappe', kategori: '🧊 FRAPPE / BLENDED', harga: 30000, stok: 20, barcode: 'FRP-005', gambar: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-15T11:00:00.000Z' },

  // 🍰 SNACKS & DESSERT
  { id: 'prod-46', nama: 'Butter Croissant', kategori: '🍰 SNACKS & DESSERT', harga: 15000, stok: 15, barcode: 'SNA-001', gambar: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-16T08:00:00.000Z' },
  { id: 'prod-47', nama: 'Chocolate Croissant', kategori: '🍰 SNACKS & DESSERT', harga: 17000, stok: 12, barcode: 'SNA-002', gambar: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-16T08:15:00.000Z' },
  { id: 'prod-48', nama: 'Banana Bread', kategori: '🍰 SNACKS & DESSERT', harga: 18000, stok: 10, barcode: 'SNA-003', gambar: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-16T08:30:00.000Z' },
  { id: 'prod-49', nama: 'Cheesecake', kategori: '🍰 SNACKS & DESSERT', harga: 25000, stok: 8, barcode: 'SNA-004', gambar: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-16T08:45:00.000Z' },
  { id: 'prod-50', nama: 'Brownies', kategori: '🍰 SNACKS & DESSERT', harga: 20000, stok: 15, barcode: 'SNA-005', gambar: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-16T09:00:00.000Z' },
  { id: 'prod-51', nama: 'Tiramisu', kategori: '🍰 SNACKS & DESSERT', harga: 28000, stok: 8, barcode: 'SNA-006', gambar: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-16T09:15:00.000Z' },
  { id: 'prod-52', nama: 'French Fries', kategori: '🍰 SNACKS & DESSERT', harga: 18000, stok: 20, barcode: 'SNA-007', gambar: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-16T09:30:00.000Z' },
  { id: 'prod-53', nama: 'Chicken Wings', kategori: '🍰 SNACKS & DESSERT', harga: 25000, stok: 12, barcode: 'SNA-008', gambar: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-16T09:45:00.000Z' },
  { id: 'prod-54', nama: 'Sausage Bites', kategori: '🍰 SNACKS & DESSERT', harga: 20000, stok: 15, barcode: 'SNA-009', gambar: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-16T10:00:00.000Z' },

  // 🥤 FRESH DRINKS
  { id: 'prod-55', nama: 'Mineral Water', kategori: '🥤 FRESH DRINKS', harga: 8000, stok: 60, barcode: 'FRE-001', gambar: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-17T10:00:00.000Z' },
  { id: 'prod-56', nama: 'Orange Juice', kategori: '🥤 FRESH DRINKS', harga: 18000, stok: 30, barcode: 'FRE-002', gambar: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-17T10:15:00.000Z' },
  { id: 'prod-57', nama: 'Apple Juice', kategori: '🥤 FRESH DRINKS', harga: 18000, stok: 30, barcode: 'FRE-003', gambar: 'https://images.unsplash.com/photo-1568270129948-9d3b9636511a?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-17T10:30:00.000Z' },
  { id: 'prod-58', nama: 'Lemon Soda', kategori: '🥤 FRESH DRINKS', harga: 20000, stok: 25, barcode: 'FRE-004', gambar: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-17T10:45:00.000Z' },
  { id: 'prod-59', nama: 'Lychee Soda', kategori: '🥤 FRESH DRINKS', harga: 20000, stok: 25, barcode: 'FRE-005', gambar: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-17T11:00:00.000Z' },
  { id: 'prod-60', nama: 'Strawberry Soda', kategori: '🥤 FRESH DRINKS', harga: 20000, stok: 25, barcode: 'FRE-006', gambar: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-17T11:15:00.000Z' },
  { id: 'prod-61', nama: 'Sparkling Water', kategori: '🥤 FRESH DRINKS', harga: 15000, stok: 30, barcode: 'FRE-007', gambar: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-17T11:30:00.000Z' },

  // ✨ ADD ONS
  { id: 'prod-62', nama: 'Extra Espresso Shot', kategori: '✨ ADD ONS', harga: 5000, stok: 100, barcode: 'ADD-001', gambar: 'https://images.unsplash.com/photo-1510707513159-42441c590d63?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-18T10:00:00.000Z' },
  { id: 'prod-63', nama: 'Oat Milk', kategori: '✨ ADD ONS', harga: 7000, stok: 50, barcode: 'ADD-002', gambar: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-18T10:15:00.000Z' },
  { id: 'prod-64', nama: 'Almond Milk', kategori: '✨ ADD ONS', harga: 8000, stok: 50, barcode: 'ADD-003', gambar: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-18T10:30:00.000Z' },
  { id: 'prod-65', nama: 'Whipped Cream', kategori: '✨ ADD ONS', harga: 5000, stok: 80, barcode: 'ADD-004', gambar: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-18T10:45:00.000Z' },
  { id: 'prod-66', nama: 'Extra Syrup', kategori: '✨ ADD ONS', harga: 5000, stok: 80, barcode: 'ADD-005', gambar: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-18T11:00:00.000Z' },
  { id: 'prod-67', nama: 'Less Sugar / No Sugar', kategori: '✨ ADD ONS', harga: 0, stok: 999, barcode: 'ADD-006', gambar: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-18T11:15:00.000Z' },
  { id: 'prod-68', nama: 'Less Ice / No Ice', kategori: '✨ ADD ONS', harga: 0, stok: 999, barcode: 'ADD-007', gambar: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=300&auto=format&fit=crop&q=60', createdAt: '2026-05-18T11:30:00.000Z' }
];

export const initialStoreSettings: StoreSettings = {
  namaToko: 'IT TECH SOLUTION',
  alamat: 'Jl. Boulevard Raya Blok H4 No. 12, Jakarta',
  telepon: '021-82736452',
  logo: 'https://images.unsplash.com/photo-1473187983305-f615310e7daa?w=100&auto=format&fit=crop&q=60',
  nmid: 'ID1026514400302',
  merchantId: '93600915',
  kota: 'Kab. Tangerang',
  kodePos: '15810',
  rawQrisPayload: ''
};

// Generate historical transactions up to June 18, 2026 (the current time in prompt)
export const getInitialTransactions = (): Transaction[] => {
  return [
    {
      id: 'TRX-20260612-0001',
      tanggal: '2026-06-12T10:15:30.000Z',
      pelanggan: 'Budi Santoso',
      subtotal: 51000,
      diskon: 5000,
      pajak: 5060, // ~11% tax applied to (subtotal - diskon)
      total: 51060,
      metodePembayaran: 'Tunai',
      uangDibayar: 100000,
      kembalian: 48940,
      items: [
        { productId: 'prod-1', nama: 'Americano', harga: 18000, qty: 2, subtotal: 36000 },
        { productId: 'prod-46', nama: 'Butter Croissant', harga: 15000, qty: 1, subtotal: 15000 }
      ]
    },
    {
      id: 'TRX-20260613-0001',
      tanggal: '2026-06-13T14:30:00.000Z',
      pelanggan: 'Siti Aminah',
      subtotal: 78000,
      diskon: 0,
      pajak: 8580,
      total: 86580,
      metodePembayaran: 'QRIS',
      uangDibayar: 86580,
      kembalian: 0,
      items: [
        { productId: 'prod-41', nama: 'Mocha Frappe', harga: 28000, qty: 1, subtotal: 28000 },
        { productId: 'prod-49', nama: 'Cheesecake', harga: 25000, qty: 2, subtotal: 50000 }
      ]
    },
    {
      id: 'TRX-20260614-0001',
      tanggal: '2026-06-14T11:45:10.000Z',
      pelanggan: 'Andi Wijaya',
      subtotal: 55000,
      diskon: 2000,
      pajak: 5830,
      total: 58830,
      metodePembayaran: 'Transfer',
      uangDibayar: 58830,
      kembalian: 0,
      items: [
        { productId: 'prod-19', nama: 'Matcha Latte', harga: 25000, qty: 1, subtotal: 25000 },
        { productId: 'prod-45', nama: 'Oreo Frappe', harga: 30000, qty: 1, subtotal: 30000 }
      ]
    },
    {
      id: 'TRX-20260615-0001',
      tanggal: '2026-06-15T16:20:00.000Z',
      pelanggan: 'Rina Herawati',
      subtotal: 35000,
      diskon: 0,
      pajak: 3850,
      total: 38850,
      metodePembayaran: 'Tunai',
      uangDibayar: 50000,
      kembalian: 11150,
      items: [
        { productId: 'prod-46', nama: 'Butter Croissant', harga: 15000, qty: 1, subtotal: 15000 },
        { productId: 'prod-3', nama: 'Double Espresso', harga: 20000, qty: 1, subtotal: 20000 }
      ]
    },
    {
      id: 'TRX-20260616-0001',
      tanggal: '2026-06-16T09:10:00.000Z',
      pelanggan: 'Denny',
      subtotal: 114000,
      diskon: 10000,
      pajak: 11440,
      total: 115440,
      metodePembayaran: 'QRIS',
      uangDibayar: 115440,
      kembalian: 0,
      items: [
        { productId: 'prod-41', nama: 'Mocha Frappe', harga: 28000, qty: 2, subtotal: 56000 },
        { productId: 'prod-48', nama: 'Banana Bread', harga: 18000, qty: 2, subtotal: 36000 },
        { productId: 'prod-20', nama: 'Chocolate', harga: 22000, qty: 1, subtotal: 22000 }
      ]
    },
    {
      id: 'TRX-20260617-0001',
      tanggal: '2026-06-17T13:22:15.000Z',
      pelanggan: 'Santi',
      subtotal: 61000,
      diskon: 0,
      pajak: 6710,
      total: 67710,
      metodePembayaran: 'Tunai',
      uangDibayar: 70000,
      kembalian: 2290,
      items: [
        { productId: 'prod-12', nama: 'Iced Americano', harga: 18000, qty: 1, subtotal: 18000 },
        { productId: 'prod-50', nama: 'Brownies', harga: 20000, qty: 1, subtotal: 20000 },
        { productId: 'prod-13', nama: 'Iced Latte', harga: 23000, qty: 1, subtotal: 23000 }
      ]
    },
    {
      id: 'TRX-20260617-0002',
      tanggal: '2026-06-17T18:40:00.000Z',
      pelanggan: 'Fajar',
      subtotal: 25000,
      diskon: 0,
      pajak: 2750,
      total: 27750,
      metodePembayaran: 'QRIS',
      uangDibayar: 27750,
      kembalian: 0,
      items: [
        { productId: 'prod-27', nama: 'Aren Latte (Palm Sugar)', harga: 25000, qty: 1, subtotal: 25000 }
      ]
    },
    {
      id: 'TRX-20260618-0001',
      tanggal: '2026-06-18T08:30:12.000Z',
      pelanggan: 'Umum (Walk-in)',
      subtotal: 31000,
      diskon: 0,
      pajak: 3410,
      total: 34410,
      metodePembayaran: 'Tunai',
      uangDibayar: 50000,
      kembalian: 15590,
      items: [
        { productId: 'prod-12', nama: 'Iced Americano', harga: 18000, qty: 1, subtotal: 18000 },
        { productId: 'prod-55', nama: 'Mineral Water', harga: 8000, qty: 1, subtotal: 8000 },
        { productId: 'prod-62', nama: 'Extra Espresso Shot', harga: 5000, qty: 1, subtotal: 5000 }
      ]
    },
    {
      id: 'TRX-20260618-0002',
      tanggal: '2026-06-18T10:15:22.000Z',
      pelanggan: 'Lydia',
      subtotal: 98000,
      diskon: 5000,
      pajak: 10230,
      total: 103230,
      metodePembayaran: 'QRIS',
      uangDibayar: 103230,
      kembalian: 0,
      items: [
        { productId: 'prod-19', nama: 'Matcha Latte', harga: 25000, qty: 2, subtotal: 50000 },
        { productId: 'prod-48', nama: 'Banana Bread', harga: 18000, qty: 1, subtotal: 18000 },
        { productId: 'prod-45', nama: 'Oreo Frappe', harga: 30000, qty: 1, subtotal: 30000 }
      ]
    },
    {
      id: 'TRX-20260618-0003',
      tanggal: '2026-06-18T12:45:00.000Z',
      pelanggan: 'Doni',
      subtotal: 73000,
      diskon: 0,
      pajak: 8030,
      total: 81030,
      metodePembayaran: 'Transfer',
      uangDibayar: 81030,
      kembalian: 0,
      items: [
        { productId: 'prod-27', nama: 'Aren Latte (Palm Sugar)', harga: 25000, qty: 1, subtotal: 25000 },
        { productId: 'prod-28', nama: 'Vietnam Drip Coffee', harga: 26000, qty: 1, subtotal: 26000 },
        { productId: 'prod-39', nama: 'Milk Tea', harga: 22000, qty: 1, subtotal: 22000 }
      ]
    }
  ];
};
