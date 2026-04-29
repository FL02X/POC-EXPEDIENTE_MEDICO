import { NextResponse } from 'next/server'

export async function POST(request) {
  const body = await request.json()
  const { cedula } = body || {}
  const valid = typeof cedula === 'string' && /^[0-9]{6,12}$/.test(cedula)
  return NextResponse.json({ valid })
}
