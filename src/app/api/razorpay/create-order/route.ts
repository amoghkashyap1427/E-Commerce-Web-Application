import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { amount, items } = await req.json();
    // items expected: [{ variant_id, quantity }]

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }
    await supabaseAdmin.rpc('release_expired_holds');

    // Reserve stock immediately, atomically, per item
    const reserved: { variant_id: string; quantity: number }[] = [];

    for (const item of items) {
      const { data: success } = await supabaseAdmin.rpc('decrement_stock', {
        variant_id_input: item.variant_id,
        quantity_input: item.quantity,
      });

      if (!success) {
        // Roll back anything we already reserved in this same request
        for (const r of reserved) {
          await supabaseAdmin.rpc('release_stock', {
            variant_id_input: r.variant_id,
            quantity_input: r.quantity,
          });
        }

        return NextResponse.json(
          { error: 'insufficient_stock', message: 'Sorry, one of the items in your cart just sold out.' },
          { status: 400 }
        );
      }

      reserved.push({ variant_id: item.variant_id, quantity: item.quantity });
    }

    // Stock is now reserved — create the real Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    // Record the hold so we can release it later if payment never completes
    const holdRows = items.map((item: any) => ({
      razorpay_order_id: order.id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      status: 'pending',
    }));

    await supabaseAdmin.from('stock_holds').insert(holdRows);

    return NextResponse.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}