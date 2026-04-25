import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { mode, email, password, name } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = {
      id: `usr_${Date.now()}`,
      name: mode === 'SIGN_UP' && name ? name : email.split('@')[0],
      email: email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };

    return NextResponse.json({ success: true, user });
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
