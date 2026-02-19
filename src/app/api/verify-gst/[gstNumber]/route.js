import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { gstNumber } = params
  const { searchParams } = new URL(request.url)
  const GST_SECRET_KEY = searchParams.get('key')

  if (!gstNumber) {
    return NextResponse.json(
      { message: 'GST number is required' },
      { status: 400 },
    )
  }

  if (!GST_SECRET_KEY) {
    console.error('GST_SECRET_KEY is not set in environment variables')
    return NextResponse.json(
      { message: 'Server configuration error' },
      { status: 500 },
    )
  }

  try {
    console.log('Verifying GST:', gstNumber)
    const response = await fetch(
      `https://sheet.gstincheck.co.in/check/${GST_SECRET_KEY}/${gstNumber}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    )

    if (response.status === 404) {
      return NextResponse.json(
        { message: 'GST number not found or invalid' },
        { status: 404 },
      )
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GST API Error:', errorText)
      return NextResponse.json(
        { message: 'Failed to verify GST with the verification service' },
        { status: 502 },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('GST verification error:', error)
    return NextResponse.json(
      {
        message: 'Failed to process GST verification',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
