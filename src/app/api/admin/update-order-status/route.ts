import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const { orderId, status } = await req.json();

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}