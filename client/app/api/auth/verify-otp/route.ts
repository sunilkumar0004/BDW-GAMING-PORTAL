import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { contact, code } = await req.json();
    
    if (code !== '123456') {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    }

    // Simulate database user fetch/create
    const user = {
      id: `dev_${Date.now()}`,
      name: `User ${contact.substring(0, 4)}`,
      [contact.includes('@') ? 'email' : 'phone']: contact,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact}`
    };

    return NextResponse.json({ success: true, user });
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
