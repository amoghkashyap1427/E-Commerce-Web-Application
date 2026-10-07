"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Leaf, Heart, Star } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { products } = useAdminStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const bestsellers = products.slice(0, 3);
  const samplePack = products.find(p => p.category.toLowerCase().includes("sample"));

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] md:h-[70vh] flex items-center justify-center bg-muted/30 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero.png" 
            alt="Traditional Indian Spices and Pickles" 
            fill 
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
        </div>
        
        <div className="container relative z-10 px-4 md:px-6">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary leading-tight">
              Ghar Ka Bana Achaar.
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 font-medium">
              The authentic taste of home. Made with real mustard oil, family recipes, and zero preservatives.
            </p>
            <div className="pt-4">
              <Link href="/shop" className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-md shadow-md hover:bg-primary/90 transition-all text-lg group">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center justify-center p-4">
              <div className="bg-secondary/20 p-4 rounded-full mb-3 text-secondary-foreground">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-serif font-semibold text-lg">Maa Ke Haath Ka</h3>
              <p className="text-sm text-muted-foreground mt-1">Authentic Family Recipe</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <div className="bg-secondary/20 p-4 rounded-full mb-3 text-secondary-foreground">
                <Leaf className="h-8 w-8" />
              </div>
              <h3 className="font-serif font-semibold text-lg">100% Natural</h3>
              <p className="text-sm text-muted-foreground mt-1">No Artificial Preservatives</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <div className="bg-secondary/20 p-4 rounded-full mb-3 text-secondary-foreground">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="font-serif font-semibold text-lg">FSSAI Certified</h3>
              <p className="text-sm text-muted-foreground mt-1">Safe & Hygienic</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <div className="bg-secondary/20 p-4 rounded-full mb-3 text-secondary-foreground">
                <div className="font-bold text-xl">₹</div>
              </div>
              <h3 className="font-serif font-semibold text-lg">Secure Payments</h3>
              <p className="text-sm text-muted-foreground mt-1">Razorpay Integration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary">Shop by Category</h2>
            <div className="w-24 h-1 bg-secondary mx-auto mt-6 rounded-full" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from(new Set(products.map(p => p.category))).slice(0,4).map((category, i) => (
              <Link href={`/shop?category=${category}`} key={category} className="group relative h-64 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                <Image 
                  src={`/images/categories/${category.toLowerCase()}.png`} 
                  alt={category} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="font-serif text-2xl font-bold">{category}</h3>
                  <p className="text-sm opacity-90 mt-1 group-hover:underline underline-offset-4">View Pickles</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-4">Our Bestsellers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Discover the flavors our customers love the most.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {bestsellers.map((product) => (
              <div key={product.id} className="bg-card rounded-xl overflow-hidden shadow-sm border border-border group hover:shadow-lg transition-all flex flex-col">
                <Link href={`/product/${product.id}`} className="relative h-72 overflow-hidden block">
                  <Image 
                    src={product.image_url} 
                    alt={product.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {product.is_veg && (
                    <div className="absolute top-4 right-4 bg-white p-1.5 rounded-md border border-green-600 shadow-sm">
                      <div className="w-3 h-3 bg-green-600 rounded-full" />
                    </div>
                  )}
                </Link>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-3 flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground mb-1 block">
                        {product.category}
                      </span>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-serif text-2xl font-bold text-foreground line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
                      </Link>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                    {product.description}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                    <span className="font-bold text-xl text-primary">
                      ₹{product.variants[0]?.price || 0}
                    </span>
                    <Link href={`/product/${product.id}`} className="flex items-center text-primary font-medium hover:underline">
                      Shop Now <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/shop" className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary font-bold rounded-md hover:bg-primary hover:text-white transition-colors">
              View All Pickles
            </Link>
          </div>
        </div>
      </section>

      {/* Sample Pack Promo */}
      {samplePack && (
        <section className="py-16 bg-secondary/10 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-2/5 relative h-64 md:h-auto">
                <Image src={samplePack.image_url} alt="Sample Pack" fill className="object-cover" />
              </div>
              <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
                <span className="text-secondary-foreground font-bold tracking-wider uppercase text-sm mb-2">First Time Buyer?</span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">{samplePack.name}</h2>
                <p className="text-lg text-muted-foreground mb-6">{samplePack.description}</p>
                <div className="flex items-center gap-6">
                  <span className="text-3xl font-bold text-foreground">₹{samplePack.variants[0]?.price || 0}</span>
                  <Link href={`/product/${samplePack.id}`} className="px-8 py-3 bg-secondary text-secondary-foreground font-bold rounded shadow hover:bg-secondary/90 transition-colors">
                    Try it out
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Meet the Maker / Brand Story */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src="/images/hero.png" 
                alt="Meet the Maker" 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="w-full md:w-1/2 space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif font-bold">The Story of Choudharyji</h2>
              <div className="w-24 h-1 bg-secondary rounded-full" />
              <p className="text-lg opacity-90 leading-relaxed">
                "It started in our ancestral courtyard in Bihar. Every summer, my grandmother would meticulously wash, cut, and sun-dry raw mangoes. The smell of freshly ground mustard, fennel, and fenugreek would fill the air."
              </p>
              <p className="text-lg opacity-90 leading-relaxed">
                We realized this authentic, chemical-free taste was getting lost in today's world of factory-made, vinegar-laden pickles. Choudharyji was born to bring back that nostalgic 'Ghar ka Achaar'.
              </p>
              <p className="text-xl font-serif italic mt-4 text-secondary">
                - The Choudhary Family
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-12">What Our Family Says</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Rahul S.", review: "Just like my grandmother's! The mango pickle took me straight back to my childhood summers." },
              { name: "Priya M.", review: "Finally, a brand that doesn't use artificial colors or vinegar. Pure mustard oil taste. Highly recommended." },
              { name: "Amit K.", review: "The sample pack was a great idea. Ended up ordering 1kg jars of the Garlic and Mixed pickles!" }
            ].map((review, idx) => (
              <div key={idx} className="bg-card p-8 rounded-xl shadow border border-border text-left relative">
                <div className="text-secondary absolute top-4 right-4">
                  <Heart className="h-6 w-6 fill-current" />
                </div>
                <div className="flex text-yellow-500 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                </div>
                <p className="text-foreground/80 italic mb-6">"{review.review}"</p>
                <p className="font-bold text-primary font-serif">— {review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
