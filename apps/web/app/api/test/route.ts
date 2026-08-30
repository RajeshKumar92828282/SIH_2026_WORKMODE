import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  try {
    const arrayBuffer = await req.arrayBuffer();
    const rawBody = new TextDecoder().decode(arrayBuffer);
    console.log('[TEST DEBUG] Raw body:', rawBody);
    console.log('[TEST DEBUG] Raw body length:', rawBody.length);
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Invalid JSON', 
        debug: { rawBody: rawBody.substring(0, 100) } 
      }, { status: 400 });
    }
    return NextResponse.json({ received: body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}