import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.length !== 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const res = await fetch(
      `https://api.msg91.com/api/sendotp.php?authkey=${process.env.MSG91_AUTH_KEY}&mobile=91${phone}`
    );

    const text = await res.text();
    console.log('MSG91 send response:', text);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}