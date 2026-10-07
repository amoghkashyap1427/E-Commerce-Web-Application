import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyCustomerToken } from '@/lib/customer-jwt';

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ customer: null });
  }

  const payload = verifyCustomerToken(token);

  if (!payload) {
    // Token is invalid, expired, or tampered with
    return NextResponse.json({ customer: null });
  }

  const { data: customer, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('id', payload.customerId)
    .maybeSingle();

  if (error || !customer) {
    return NextResponse.json({ customer: null });
  }

  return NextResponse.json({ customer });
}