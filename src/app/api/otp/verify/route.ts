import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    const res = await fetch(
      `https://api.msg91.com/api/verifyRequestOTP.php?authkey=${process.env.MSG91_AUTH_KEY}&mobile=91${phone}&otp=${otp}`
    );

    const text = await res.text();
    console.log('MSG91 verify response:', text);

    // MSG91 returns a JSON-like or plain text response indicating success/failure
    const isSuccess = text.toLowerCase().includes('success');

    return NextResponse.json({ verified: isSuccess });
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 500 });
  }
}