import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { contact } = await req.json();
    if (!contact) {
      return NextResponse.json({ error: 'Contact is required' }, { status: 400 });
    }

    // Simulate OTP generation
    const mockOtp = '123456';
    
    // In a real app this would call Twilio / SendGrid.
    console.log(`\n=================================\n🔐 MOCK OTP for ${contact}: ${mockOtp}\n=================================\n`);

    return NextResponse.json({ success: true, message: 'OTP Sent successfully' });
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
