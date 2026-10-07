import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './data';
import { supabase } from './supabase';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  amount: number;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

const initialCustomers: Customer[] = [
  { id: "CUST-001", name: "Rahul S.", email: "rahul@example.com", totalOrders: 2, totalSpent: 1098 },
  { id: "CUST-002", name: "Priya M.", email: "priya@example.com", totalOrders: 5, totalSpent: 4500 },
  { id: "CUST-003", name: "Amit K.", email: "amit@example.com", totalOrders: 1, totalSpent: 349 },
  { id: "CUST-004", name: "Neha G.", email: "neha@example.com", totalOrders: 3, totalSpent: 2997 },
];

interface AdminStore {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  isLoading: boolean;

  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;

  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      products: [],
      orders: [],
      customers: initialCustomers,
      isLoading: false,

      fetchProducts: async () => {
        set({ isLoading: true });

        const { data, error } = await supabase
          .from('products')
          .select('*, product_variants(*), product_images(*)');

        if (error) {
          console.error('Error fetching products:', error);
          set({ isLoading: false });
          return;
        }

        const products: Product[] = (data ?? []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category,
          ingredients: p.ingredients,
          spice_level: p.spice_level,
          is_veg: p.is_veg,
          image_url: p.product_images?.[0]?.image_url ||
            '/images/categories/mango.png',
          variants: (p.product_variants ?? []).map((v: any) => ({
            id: v.id,
            weight: v.weight,
            price: Number(v.price),
            stock_quantity: v.stock_quantity,
          })),
        }));

        set({ products, isLoading: false });
      },

      addProduct: async (product) => {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });

        if (!res.ok) {
          console.error('Failed to add product');
          return false;
        }

        await get().fetchProducts();
        return true;
      },

      updateProduct: async (updatedProduct) => {
        const res = await fetch(`/api/admin/products/${updatedProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct),
        });

        if (!res.ok) {
          console.error('Failed to update product');
          return false;
        }

        await get().fetchProducts();
        return true;
      },

      deleteProduct: async (id) => {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          console.error('Failed to delete product');
          return false;
        }

        set((state) => ({ products: state.products.filter(p => p.id !== id) }));
        return true;
      },

      fetchOrders: async () => {
        const res = await fetch('/api/admin/orders');
        if (!res.ok) {
          console.error('Failed to fetch orders');
          return;
        }
        const data = await res.json();

        const orders: Order[] = data.map((o: any) => ({
          id: o.id,
          customerName: o.shipping_address?.name || 'Unknown',
          customerEmail: o.shipping_address?.email || '—',
          status: o.status,
          amount: Number(o.total_amount),
          date: o.created_at,
        }));

        set({ orders });
      },

      updateOrderStatus: async (orderId, status) => {
        set((state) => ({
          orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
        }));

        const res = await fetch('/api/admin/update-order-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status }),
        });

        if (!res.ok) {
          console.error('Failed to update order status on server');
        }
      },
    }),
    {
      name: 'choudharyji-admin',
    }
  )
);