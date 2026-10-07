"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Product } from "@/lib/data";

import { useCartStore } from "@/lib/store";

export function ProductClient({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const isOutOfStock = selectedVariant.stock_quantity <= 0;

  // Reset quantity to 1 whenever the selected variant changes, and cap it at available stock
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant.id]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <span className="text-3xl font-bold text-foreground">₹{selectedVariant.price}</span>
        <span className="text-muted-foreground ml-2">Inclusive of all taxes</span>
      </div>

      <div className="mb-8 space-y-4">
        <label className="block text-sm font-semibold uppercase tracking-wider text-foreground">
          Select Size
        </label>
        <div className="flex flex-wrap gap-3">
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => setSelectedVariant(variant)}
              className={`px-4 py-2 rounded-md border font-medium transition-colors relative ${
                selectedVariant.id === variant.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/50 text-foreground"
              } ${variant.stock_quantity <= 0 ? "opacity-50" : ""}`}
            >
              {variant.weight}
              {variant.stock_quantity <= 0 && (
                <span className="ml-1 text-xs">(Out of Stock)</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex items-center border border-border rounded-md bg-background">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={isOutOfStock}
            className="p-3 hover:bg-muted text-foreground transition-colors rounded-l-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(selectedVariant.stock_quantity, quantity + 1))}
            disabled={isOutOfStock || quantity >= selectedVariant.stock_quantity}
            className="p-3 hover:bg-muted text-foreground transition-colors rounded-r-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-md font-bold transition-all ${
            isOutOfStock
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : isAdded
              ? "bg-green-600 text-white"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm"
          }`}
        >
          {isOutOfStock ? (
            "Out of Stock"
          ) : isAdded ? (
            "Added to Cart!"
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </>
          )}
        </button>
      </div>

      <div className="text-sm text-muted-foreground">
        {isOutOfStock ? (
          <p className="flex items-center mb-1 text-red-600 font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Out of stock — we're restocking soon, check back shortly!
          </p>
        ) : (
          <>
            <p className="flex items-center mb-1">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              In stock ({selectedVariant.stock_quantity} left)
            </p>
            <p>Usually ships within 24 hours.</p>
          </>
        )}
      </div>
    </div>
  );
}