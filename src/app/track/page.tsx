"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package, Truck, CheckCircle2 } from "lucide-react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams?.get("id") || "";
  
  const [orderId, setOrderId] = useState(initialOrderId);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-search if ID is present in URL
  useState(() => {
    if (initialOrderId) {
      handleSearch(new Event('submit') as any, initialOrderId);
    }
  });

  async function handleSearch(e: React.FormEvent, idToSearch = orderId) {
    if (e) e.preventDefault();
    if (!idToSearch) return;
    
    setIsSearching(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock tracking data based on ID
    if (idToSearch.includes("mock") || idToSearch.includes("demo")) {
      setTrackingData({
        id: idToSearch,
        date: new Date().toLocaleDateString(),
        status: "packed", // placed, packed, shipped, delivered
        items: [
          { name: "Classic Mango Pickle", quantity: 1, size: "500g" },
        ]
      });
    } else {
      // Simulate not found
      setTrackingData({ notFound: true });
    }
    
    setIsSearching(false);
  }

  const steps = [
    { id: 'placed', label: 'Order Placed', icon: Package },
    { id: 'packed', label: 'Packed', icon: Package },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: string) => steps.findIndex(s => s.id === status);

  return (
    <div className="container mx-auto px-4 max-w-3xl">
      <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-8 text-center">Track Your Order</h1>

      <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input 
            type="text" 
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter your Order ID (e.g., mock_order_123)"
            className="flex-1 px-4 py-3 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background"
            required
          />
          <button 
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md shadow hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center"
          >
            {isSearching ? "Searching..." : <><Search className="h-5 w-5 mr-2" /> Track</>}
          </button>
        </form>
      </div>

      {trackingData && !trackingData.notFound && (
        <div className="bg-card p-6 md:p-12 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-12">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Order ID</p>
              <h2 className="font-mono font-bold text-xl">{trackingData.id}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Date</p>
              <h2 className="font-bold text-xl">{trackingData.date}</h2>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="relative mb-12">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-1000"
              style={{ width: `${(getStepIndex(trackingData.status) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            <div className="relative z-10 flex justify-between">
              {steps.map((step, idx) => {
                const isCompleted = idx <= getStepIndex(trackingData.status);
                const isCurrent = idx === getStepIndex(trackingData.status);
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-card transition-colors ${isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className={`mt-3 text-sm font-semibold ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {trackingData?.notFound && (
        <div className="bg-red-50 text-red-800 p-6 rounded-xl border border-red-200 text-center">
          <h3 className="font-bold text-lg mb-2">Order Not Found</h3>
          <p>We couldn't find an order with that ID. Please check and try again.</p>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <Suspense fallback={<div>Loading...</div>}>
        <TrackOrderContent />
      </Suspense>
    </div>
  );
}
