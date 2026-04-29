import { NextResponse } from 'next/server'

export async function POST() {
  // SIMULA VALIDACION
  await new Promise(resolve => setTimeout(resolve, 1000))
  return NextResponse.json({ success: true })
}
