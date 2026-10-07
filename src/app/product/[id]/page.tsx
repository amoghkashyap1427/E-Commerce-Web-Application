"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Leaf, ArrowLeft, Star } from "lucide-react";
import { ProductClient } from "./ProductClient";
import { useAdminStore } from "@/lib/admin-store";
import { useState, useEffect, use } from "react";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { products } = useAdminStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const product = products.find((p) => p.id === resolvedParams.id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/shop" className="text-primary hover:underline">Return to shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container mx-auto px-4">
        <Link href="/shop" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>

        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Image Gallery */}
            <div className="w-full md:w-1/2 relative bg-muted/20">
              <div className="relative aspect-square md:aspect-auto md:h-full min-h-[400px]">
                <Image 
                  src={product.image_url} 
                  alt={product.name} 
                  fill 
                  className="object-cover"
                  priority
                />
                {product.is_veg && (
                  <div className="absolute top-6 left-6 bg-white p-1.5 rounded-md border border-green-600 shadow-sm">
                    <div className="w-4 h-4 bg-green-600 rounded-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Product Info (Client Component for interactive variant selection & Add to Cart) */}
            <div className="w-full md:w-1/2 p-8 md:p-12">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider text-secondary-foreground">
                  {product.category}
                </span>
                <div className="flex text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-muted-foreground text-sm ml-2 font-sans">(24 reviews)</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-4">
                {product.name}
              </h1>
              
              <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                {product.description}
              </p>

              {/* Client Component for interactive elements */}
              <ProductClient product={product} />

              {/* Ingredients & Details */}
              <div className="mt-12 pt-8 border-t border-border space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-lg mb-2 flex items-center">
                    <Leaf className="h-5 w-5 mr-2 text-primary" /> Ingredients
                  </h3>
                  <p className="text-foreground/80 text-sm leading-relaxed">{product.ingredients}</p>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 bg-secondary/10 p-4 rounded-lg">
                    <span className="block text-xs font-semibold text-secondary-foreground uppercase mb-1">Spice Level</span>
                    <span className="font-serif font-bold text-lg">{product.spice_level}</span>
                  </div>
                  <div className="flex-1 bg-primary/5 p-4 rounded-lg">
                    <span className="block text-xs font-semibold text-primary/70 uppercase mb-1">Shelf Life</span>
                    <span className="font-serif font-bold text-lg">12 Months</span>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-start gap-3">
                  <ShieldCheck className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-green-900">100% Natural Guarantee</h4>
                    <p className="text-sm text-green-800/80 mt-1">We never use artificial colors, flavors, or chemical preservatives. Only real mustard oil acts as a natural preservative.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
