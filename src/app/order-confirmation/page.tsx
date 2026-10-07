"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("id");

  return (
    <div className="bg-card p-12 rounded-2xl border border-border shadow-sm max-w-lg w-full text-center">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-serif font-bold text-primary mb-2">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-6">
        Thank you for choosing Choudharyji. Your authentic pickles are being packed with love.
      </p>

      {orderId && (
        <div className="bg-muted p-4 rounded-lg mb-8">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Order ID</p>
          <p className="font-mono font-bold text-lg">{orderId}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link href={`/track?id=${orderId || ''}`} className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-md shadow hover:bg-primary/90 transition-colors w-full">
          Track Order <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <Link href="/shop" className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-border text-foreground font-semibold rounded-md hover:bg-muted transition-colors w-full">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4 flex flex-col items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <OrderConfirmationContent />
      </Suspense>
    </div>
  );
}
