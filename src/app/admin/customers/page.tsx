"use client";

import { useState, useEffect } from "react";
import { Search, Mail, ExternalLink } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";

export default function AdminCustomersPage() {
  const [mounted, setMounted] = useState(false);
  const { customers } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-foreground">Customers</h1>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-sm border-b border-border">
                <th className="p-4 font-medium">Customer ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium text-center">Total Orders</th>
                <th className="p-4 font-medium text-right">Total Spent</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border/50 text-sm hover:bg-muted/30">
                    <td className="p-4 font-mono font-medium text-muted-foreground">{customer.id}</td>
                    <td className="p-4 font-medium text-foreground">{customer.name}</td>
                    <td className="p-4">
                      <a href={`mailto:${customer.email}`} className="inline-flex items-center text-primary hover:underline">
                        <Mail className="h-3 w-3 mr-1" />
                        {customer.email}
                      </a>
                    </td>
                    <td className="p-4 text-center font-medium">
                      <span className="px-2 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-xs">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold">₹{customer.totalSpent.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors inline-flex items-center gap-1" title="View Details">
                        <span className="sr-only">View Profile</span>
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
