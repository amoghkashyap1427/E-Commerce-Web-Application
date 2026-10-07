"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { Trash2, Minus, Plus, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="bg-card p-12 rounded-2xl border border-border shadow-sm max-w-lg w-full">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8 text-lg">Looks like you haven't added any authentic pickles to your cart yet.</p>
          <Link href="/shop" className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-md shadow hover:bg-primary/90 transition-colors w-full">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-foreground">
                        <Link href={`/product/${item.product.id}`} className="hover:text-primary transition-colors">
                          {item.product.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Size: {item.variant.weight}</p>
                    </div>
                    <span className="font-bold text-lg text-primary">₹{item.variant.price * item.quantity}</span>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center border border-border rounded-md bg-background overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 hover:bg-muted text-foreground transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 hover:bg-muted text-foreground transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-2 transition-colors flex items-center text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <Link href="/shop" className="inline-flex items-center text-muted-foreground hover:text-primary mt-6 font-medium">
              <ArrowLeft className="h-4 w-4 mr-2" /> Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm sticky top-24">
              <h2 className="font-serif text-xl font-bold mb-6 border-b border-border pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">₹{getTotal()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-foreground font-medium">Calculated at checkout</span>
                </div>
                <div className="border-t border-border pt-4 mt-4 flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">₹{getTotal()}</span>
                </div>
              </div>

              <Link href="/checkout" className="w-full flex items-center justify-center gap-2 py-4 bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors font-bold rounded-lg shadow-sm text-lg">
                Proceed to Checkout <ArrowRight className="h-5 w-5" />
              </Link>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> Secure checkout powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
