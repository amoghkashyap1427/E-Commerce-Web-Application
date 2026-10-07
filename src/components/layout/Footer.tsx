import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold">Choudharyji</h3>
            <p className="text-primary-foreground/80 text-sm">
              The authentic taste of home. Traditional homemade Indian pickles made with love, real mustard oil, and zero preservatives.
            </p>
            <div className="pt-2">
              <span className="text-sm font-semibold border border-primary-foreground/30 px-3 py-1 rounded">
                FSSAI: 12345678901234
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link href="/shop" className="hover:text-white transition-colors">Shop All</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold">Policies</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/refunds" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold">Connect with us</h4>
            <p className="text-sm text-primary-foreground/80">
              Join our community and get updates on new flavors and offers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-secondary transition-colors" aria-label="Facebook">
                FB
              </a>
              <a href="#" className="hover:text-secondary transition-colors" aria-label="Instagram">
                IG
              </a>
              <a href="#" className="hover:text-secondary transition-colors" aria-label="Twitter">
                X
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Choudharyji. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
