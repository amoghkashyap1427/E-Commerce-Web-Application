"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Filter, ShoppingCart, Minus, Plus } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import { useCartStore } from "@/lib/store";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function ProductCard({ product }: { product: any }) {
  const defaultVariant = product.variants[0];
  const isOutOfStock = defaultVariant?.stock_quantity <= 0;

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border group hover:shadow-lg transition-all flex flex-col">
      <Link href={`/product/${product.id}`} className="relative h-64 overflow-hidden block">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.is_veg && (
          <div className="absolute top-4 right-4 bg-white p-1 rounded border border-green-600">
            <div className="w-3 h-3 bg-green-600 rounded-full" />
          </div>
        )}
      </Link>
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground mb-1 block">
            {product.category}
          </span>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-serif text-xl font-bold text-foreground line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
          </Link>
        </div>

        <div className="mt-auto pt-4 border-t border-border flex justify-between items-center gap-3">
          <span className="font-semibold text-lg text-primary whitespace-nowrap">
            ₹{defaultVariant?.price || 0} <span className="text-sm font-normal text-muted-foreground">/{defaultVariant?.weight || ''}</span>
          </span>

          {isOutOfStock ? (
            <span className="text-xs font-semibold text-red-600">Out of Stock</span>
          ) : (
            <span className="text-xs font-medium text-green-700">
              {defaultVariant.stock_quantity} in stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ShopContent() {
  const [mounted, setMounted] = useState(false);
  const { products, fetchProducts } = useAdminStore();
  const searchParams = useSearchParams();
  const category = searchParams?.get('category');

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, []);

  if (!mounted) return null;

  const filteredProducts = category
    ? products.filter(p => p.category.toLowerCase() === category.toLowerCase())
    : products;

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6">
          Our Authentic Collection
        </h1>
        <p className="text-lg text-foreground/80">
          Every jar of Choudharyji is made with hand-picked ingredients, traditional recipes, and real mustard oil. Find your favorite flavor.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-card p-6 rounded-xl border border-border sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-primary font-serif text-xl font-bold">
              <Filter className="h-5 w-5" />
              <h2>Categories</h2>
            </div>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shop"
                  className={`block transition-colors ${!category ? 'text-primary font-bold' : 'text-foreground/80 hover:text-primary'}`}
                >
                  All Pickles
                </Link>
              </li>
              {categories.map(cat => (
                <li key={cat}>
                  <Link
                    href={`/shop?category=${cat.toLowerCase()}`}
                    className={`block transition-colors ${category?.toLowerCase() === cat.toLowerCase() ? 'text-primary font-bold' : 'text-foreground/80 hover:text-primary'}`}
                  >
                    {cat} Pickles
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-card rounded-xl border border-border">
              <h3 className="text-2xl font-serif text-primary mb-2">No pickles found</h3>
              <p className="text-muted-foreground">We couldn't find any pickles in this category.</p>
              <Link href="/shop" className="mt-4 inline-block text-primary underline">View all products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <Suspense fallback={<div className="container mx-auto px-4 text-center py-24">Loading shop...</div>}>
        <ShopContent />
      </Suspense>
    </div>
  );
}