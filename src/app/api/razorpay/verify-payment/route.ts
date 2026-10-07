import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { signCustomerToken } from '@/lib/customer-jwt';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      total_amount,
      shipping_address,
      items,
    } = await req.json();

    // Step 1: verify the signature — this is the only thing that can genuinely fail the payment
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      await releaseHoldsForOrder(razorpay_order_id);
      return NextResponse.json({ verified: false }, { status: 400 });
    }

    // From this point on, the payment is genuinely confirmed.
    // Nothing below should ever be allowed to flip "verified" back to false —
    // any failure here is an internal bookkeeping issue, not a payment failure.

    // Step 2: mark stock holds as confirmed
    try {
      await supabaseAdmin
        .from('stock_holds')
        .update({ status: 'confirmed' })
        .eq('razorpay_order_id', razorpay_order_id);
    } catch (err) {
      console.error('Failed to confirm stock holds (payment still valid):', err);
    }

    // Step 3: save the order — this one IS important, so we check its result,
    // but even if it fails we still tell the customer their payment succeeded
    let savedOrder: { id: string } | null = null;
    try {
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          razorpay_order_id,
          razorpay_payment_id,
          status: 'placed',
          total_amount,
          shipping_address,
        })
        .select()
        .single();

      if (orderError) {
        console.error('CRITICAL: Error saving order (payment succeeded, order not saved):', orderError, {
          razorpay_payment_id,
          razorpay_order_id,
        });
      } else {
        savedOrder = order;
      }
    } catch (err) {
      console.error('CRITICAL: Exception saving order (payment succeeded, order not saved):', err, {
        razorpay_payment_id,
        razorpay_order_id,
      });
    }

    // Step 4: save order items — only if the order itself saved successfully
    if (savedOrder) {
      try {
        const orderItems = items.map((item: any) => ({
          order_id: savedOrder!.id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
        }));

        const { error: itemsError } = await supabaseAdmin
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('Error saving order items (payment and order still valid):', itemsError);
        }
      } catch (err) {
        console.error('Exception saving order items (payment and order still valid):', err);
      }
    }

    // Step 5: save/update customer record, and issue a session token for this browser
    let customerToken: string | null = null;

    if (shipping_address?.phone) {
      try {
        const { data: customer, error: customerError } = await supabaseAdmin
          .from('customers')
          .upsert(
            {
              phone: shipping_address.phone,
              name: shipping_address.name,
              email: shipping_address.email,
              address: shipping_address.address,
              city: shipping_address.city,
              state: shipping_address.state,
              pincode: shipping_address.pincode,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'phone' }
          )
          .select()
          .single();

        if (customerError) {
          console.error('Failed to save customer record (payment and order still valid):', customerError);
        } else if (customer) {
          customerToken = signCustomerToken(customer.id);
        }
      } catch (err) {
        console.error('Failed to save customer record (payment and order still valid):', err);
      }
    }

    // Stock was already decremented at order-creation time — nothing to do here

    return NextResponse.json({
      verified: true,
      orderId: savedOrder?.id ?? null,
      orderSaved: !!savedOrder,
      customerToken,
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 500 });
  }
}

async function releaseHoldsForOrder(razorpayOrderId: string) {
  const { data: holds } = await supabaseAdmin
    .from('stock_holds')
    .select('*')
    .eq('razorpay_order_id', razorpayOrderId)
    .eq('status', 'pending');

  for (const hold of holds ?? []) {
    await supabaseAdmin.rpc('release_stock', {
      variant_id_input: hold.variant_id,
      quantity_input: hold.quantity,
    });
    await supabaseAdmin
      .from('stock_holds')
      .update({ status: 'released' })
      .eq('id', hold.id);
  }
}