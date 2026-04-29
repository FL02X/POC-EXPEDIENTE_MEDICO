import { NextResponse } from 'next/server'
import { patients } from '../../../lib/mockData.js'

export async function POST(request) {
  const body = await request.json()
  const { pacienteId, validated } = body || {}
  if (!validated) {
    return NextResponse.json({ error: 'No validado' }, { status: 401 })
  }
  const p = patients[pacienteId]
  if (!p) {
    return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })
  }
  return NextResponse.json(p.expediente)
}
