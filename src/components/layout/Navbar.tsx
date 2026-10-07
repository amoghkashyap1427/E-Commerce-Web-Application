"use client";

import Link from "next/link";
import { ShoppingCart, Menu, User, Search } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useEffect, useState } from "react";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) => state.items.length);
  
  // Prevent hydration mismatch for zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground text-xs md:text-sm font-medium py-2 text-center">
        Leak-proof packaging • Delivered pan-India • No preservatives
      </div>
      
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Mobile Menu */}
        <button className="md:hidden p-2 -ml-2 text-foreground" aria-label="Menu">
          <Menu className="h-6 w-6" />
        </button>

        {/* Logo */}
        <div className="flex-1 md:flex-none flex justify-center md:justify-start">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-serif font-bold text-2xl tracking-tight text-primary">
              Choudharyji
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-foreground/80">
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <Link href="/about" className="hover:text-primary transition-colors">Our Story</Link>
          <Link href="/track" className="hover:text-primary transition-colors">Track Order</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button className="text-foreground hover:text-primary transition-colors hidden sm:block" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          <Link href="/account" className="text-foreground hover:text-primary transition-colors hidden sm:block">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/cart" className="text-foreground hover:text-primary transition-colors relative">
            <ShoppingCart className="h-5 w-5" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
