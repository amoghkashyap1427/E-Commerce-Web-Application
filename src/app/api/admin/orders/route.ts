import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*, product_variants(*, products(*)))')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }

  return NextResponse.json(data);
}