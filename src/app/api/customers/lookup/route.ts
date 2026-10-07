import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const { phone } = await req.json();

  if (!phone || phone.length < 10) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }

  return NextResponse.json({ customer: data });
}