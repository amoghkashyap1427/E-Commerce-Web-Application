"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Package, ShoppingBag, IndianRupee } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const { products, orders } = useAdminStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalRevenue = orders.reduce((acc, order) => acc + order.amount, 0);
  const totalOrders = orders.length;
  const activeListings = products.length;
  
  // Flatten variants to find low stock
  const allVariants = products.flatMap(p => p.variants.map(v => ({ product: p.name, variant: v.weight, stock: v.stock_quantity })));
  const lowStockItems = allVariants.filter(v => v.stock < 50);

  return (
    <main className="p-6 md:p-8">
      <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Dashboard Overview</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Total Revenue</h3>
            <IndianRupee className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-2">+12% from last month</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Orders</h3>
            <ShoppingBag className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">{totalOrders}</p>
          <p className="text-sm text-green-600 mt-2">+5% from last month</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Products</h3>
            <Package className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-foreground">{activeListings}</p>
          <p className="text-sm text-muted-foreground mt-2">Active listings</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Low Stock</h3>
            <ShieldCheck className="h-5 w-5 text-red-600" />
          </div>
          <p className={`text-3xl font-bold ${lowStockItems.length > 0 ? 'text-red-600' : 'text-green-600'}`}>{lowStockItems.length}</p>
          <p className="text-sm text-muted-foreground mt-2">Needs attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="font-serif text-xl font-bold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-sm">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 4).map((order) => (
                  <tr key={order.id} className="border-t border-border/50 text-sm hover:bg-muted/30">
                    <td className="p-4 font-mono text-primary">{order.id}</td>
                    <td className="p-4">{order.customerName}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'packed' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">₹{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Status */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="font-serif text-xl font-bold">Inventory Status</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-sm">
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Variant</th>
                  <th className="p-4 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {allVariants.slice(0, 5).map((item, idx) => (
                  <tr key={idx} className="border-t border-border/50 text-sm hover:bg-muted/30">
                    <td className="p-4 font-medium line-clamp-1">{item.product}</td>
                    <td className="p-4 text-muted-foreground">{item.variant}</td>
                    <td className="p-4">
                      <span className={`font-semibold ${item.stock < 50 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
