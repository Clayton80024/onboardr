import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Hybrid payment API endpoint is working!',
    timestamp: new Date().toISOString()
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    return NextResponse.json({ 
      message: 'Hybrid payment API received POST request',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Invalid JSON in request body',
      timestamp: new Date().toISOString()
    }, { status: 400 })
  }
}

