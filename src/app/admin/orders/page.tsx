"use client";

import { useState, useEffect } from "react";
import { Search, ExternalLink } from "lucide-react";
import { useAdminStore, Order } from "@/lib/admin-store";

export default function AdminOrdersPage() {
  const [mounted, setMounted] = useState(false);
  const { orders, updateOrderStatus, fetchOrders } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
    fetchOrders();
  }, []);

  if (!mounted) return null;

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus as Order['status']);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'packed': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-foreground">Orders</h1>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 bg-muted/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Order ID or Customer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-sm border-b border-border">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 text-sm hover:bg-muted/30">
                    <td className="p-4 font-mono font-medium text-primary">{order.id}</td>
                    <td className="p-4 text-muted-foreground">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">₹{order.amount}</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-2 py-1.5 rounded text-xs font-semibold cursor-pointer outline-none border border-transparent hover:border-border ${getStatusColor(order.status)}`}
                      >
                        <option value="placed">PLACED</option>
                        <option value="packed">PACKED</option>
                        <option value="shipped">SHIPPED</option>
                        <option value="delivered">DELIVERED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors inline-flex items-center gap-1" title="View Details">
                        <span className="sr-only">View Details</span>
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
