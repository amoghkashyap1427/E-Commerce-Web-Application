import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id } = await req.json();

    const { data: holds } = await supabaseAdmin
      .from('stock_holds')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to release hold:', error);
    return NextResponse.json({ error: 'Failed to release hold' }, { status: 500 });
  }
}