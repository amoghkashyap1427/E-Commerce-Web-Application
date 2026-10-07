"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, CreditCard, Phone, ArrowRight, Edit2, CheckCircle2, Loader2 } from "lucide-react";
type Step = "phone" | "details" | "payment";

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const [step, setStep] = useState<Step>("phone");
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    setMounted(true);
    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    const token = localStorage.getItem('choudharyji_customer_token');
    if (!token) {
      setCheckingSession(false);
      return;
    }

    fetch('/api/customers/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.customer) {
          const [firstName, ...rest] = (data.customer.name || "").split(" ");
          setFormData({
            firstName: firstName || "",
            lastName: rest.join(" ") || "",
            email: data.customer.email || "",
            phone: data.customer.phone || "",
            address: data.customer.address || "",
            city: data.customer.city || "",
            state: data.customer.state || "",
            pincode: data.customer.pincode || "",
          });
          setIsReturningCustomer(true);
          setStep("payment");
        }
      })
      .catch((err) => console.error('Session check failed:', err))
      .finally(() => setCheckingSession(false));
  }, [items, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.length < 10) return;

    setIsLookingUp(true);

    try {
      const res = await fetch('/api/customers/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput }),
      });

      const data = await res.json();

      if (data.customer) {
        const [firstName, ...rest] = (data.customer.name || "").split(" ");
        setFormData({
          firstName: firstName || "",
          lastName: rest.join(" ") || "",
          email: data.customer.email || "",
          phone: data.customer.phone || phoneInput,
          address: data.customer.address || "",
          city: data.customer.city || "",
          state: data.customer.state || "",
          pincode: data.customer.pincode || "",
        });
        setIsReturningCustomer(true);
      } else {
        setFormData((prev) => ({ ...prev, phone: phoneInput }));
        setIsReturningCustomer(false);
      }

      setStep("details");
    } catch (error) {
      console.error(error);
      setFormData((prev) => ({ ...prev, phone: phoneInput }));
      setStep("details");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: getTotal(),
          items: items.map((item) => ({
            variant_id: item.variant.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        if (errorData.error === 'insufficient_stock') {
          alert(errorData.message);
        } else {
          alert('Something went wrong. Please try again.');
        }
        setIsProcessing(false);
        return;
      }

      const order = await orderRes.json();

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Choudharyji Pickles",
        description: "Authentic Homemade Pickles Order",
        order_id: order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              total_amount: getTotal(),
              shipping_address: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
              },
              items: items.map((item) => ({
                variant_id: item.variant.id,
                quantity: item.quantity,
                price_at_time: item.variant.price,
              })),
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.verified) {
            if (verifyData.customerToken) {
              localStorage.setItem('choudharyji_customer_token', verifyData.customerToken);
            }
            clearCart();
            router.push(`/order-confirmation?id=${response.razorpay_payment_id}`);
          } else {
            alert("Payment verification failed. If money was deducted, it will be refunded automatically. Please contact support.");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#800000",
        },
        modal: {
          ondismiss: async function () {
            await fetch('/api/razorpay/release-hold', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ razorpay_order_id: order.id }),
            });
            setIsProcessing(false);
          },
        },
      };

      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on("payment.failed", async function (response: any) {
          await fetch('/api/razorpay/release-hold', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ razorpay_order_id: order.id }),
          });
          alert("Payment Failed: " + response.error.description);
          setIsProcessing(false);
        });
        rzp1.open();
      } else {
        throw new Error("Razorpay script not loaded");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while starting the payment. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!mounted || items.length === 0) return null;

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Preparing your checkout...</p>
      </div>
    );
  }
  const stepNumber = { phone: 1, details: 2, payment: 3 }[step];

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-2 text-center">Checkout</h1>
        <p className="text-center text-muted-foreground mb-8">
          <ShieldCheck className="inline h-4 w-4 mr-1 text-green-600" />
          Safe, secure checkout — your details are protected
        </p>

        {/* Progress indicator */}
        <div className="w-full flex justify-center mb-10">
          <div className="flex items-center gap-2 w-full max-w-sm">
            {(["phone", "details", "payment"] as Step[]).map((s, idx) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${stepNumber > idx + 1
                      ? "bg-green-600 text-white"
                      : stepNumber === idx + 1
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                >
                  {stepNumber > idx + 1 ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${stepNumber > idx + 1 ? "bg-green-600" : "bg-muted"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section */}
          <div className="lg:w-2/3">
            {/* STEP 1: Phone */}
            {step === "phone" && (
              <div className="bg-card p-6 md:p-10 rounded-xl border border-border shadow-sm max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-2.5 rounded-full">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-serif font-bold">Let's find your details</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter your phone number — if you've ordered before, we'll fill in your details automatically.
                </p>

                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">Mobile Number</label>
                    <div className="flex items-center border border-border rounded-md bg-background focus-within:ring-2 focus-within:ring-primary overflow-hidden">
                      <span className="px-4 py-2.5 text-muted-foreground border-r border-border bg-muted/40 font-medium">+91</span>
                      <input
                        required
                        type="tel"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 10-digit number"
                        className="flex-1 px-4 py-2.5 outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLookingUp || phoneInput.length !== 10}
                    className="w-full py-3.5 bg-primary text-white font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isLookingUp ? "Checking..." : "Continue"}
                    {!isLookingUp && <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                  We never share your number. Used only for order updates.
                </div>
              </div>
            )}

            {/* STEP 2: Details */}
            {step === "details" && (
              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                {isReturningCustomer && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-900">
                      Welcome back! We've filled in your details from your last order — feel free to edit anything.
                    </p>
                  </div>
                )}

                <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-serif font-bold flex items-center">
                      <span className="bg-primary text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-3">1</span>
                      Contact Information
                    </h2>
                    <button
                      type="button"
                      onClick={() => setStep("phone")}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> +91 {formData.phone}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1">First Name</label>
                      <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1">Last Name</label>
                      <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground/80 mb-1">Email Address</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background" />
                    </div>
                  </div>
                </div>

                <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
                  <h2 className="text-xl font-serif font-bold mb-6 flex items-center">
                    <span className="bg-primary text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-3">2</span>
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground/80 mb-1">Street Address</label>
                      <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background" placeholder="House number and street name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1">Town / City</label>
                      <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1">State</label>
                      <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1">PIN Code</label>
                      <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 text-lg"
                >
                  Continue to Payment <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            )}

            {/* STEP 3: Payment */}
            {step === "payment" && (
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Delivering to</p>
                      <p className="font-semibold text-foreground">{formData.firstName} {formData.lastName} · +91 {formData.phone}</p>
                      <p className="text-muted-foreground">{formData.address}, {formData.city}, {formData.state} {formData.pincode}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setStep("details")}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('choudharyji_customer_token');
                          setFormData({ firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" });
                          setIsReturningCustomer(false);
                          setPhoneInput("");
                          setStep("phone");
                        }}
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        Not you? Switch account
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
                  <h2 className="text-xl font-serif font-bold mb-6 flex items-center">
                    <span className="bg-primary text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-3">3</span>
                    Payment
                  </h2>

                  <div className="p-4 border border-secondary rounded-lg bg-secondary/10 flex items-start gap-4">
                    <CreditCard className="h-6 w-6 text-secondary-foreground flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-secondary-foreground">Secure Payment by Razorpay</h3>
                      <p className="text-sm text-muted-foreground mt-1">You will be redirected to Razorpay to complete your purchase securely. UPI, Cards, and Netbanking supported.</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full mt-6 py-4 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 transition-colors disabled:opacity-70 flex justify-center items-center gap-2 text-lg"
                  >
                    {isProcessing ? "Processing..." : `Pay ₹${getTotal()}`}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-green-600" /> 256-bit encryption</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> PCI DSS compliant</span>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm sticky top-24">
              <h2 className="font-serif text-xl font-bold mb-6 border-b border-border pb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0 border border-border">
                      <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                      <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 text-sm">
                      <h4 className="font-semibold line-clamp-1">{item.product.name}</h4>
                      <p className="text-muted-foreground">{item.variant.weight}</p>
                    </div>
                    <div className="text-sm font-semibold">
                      ₹{item.variant.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-border text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">₹{getTotal()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-border pt-4 mt-4 flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">₹{getTotal()}</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span>100% Secure Checkout</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span>Free shipping on all orders</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}