import { NextResponse } from 'next/server'
import { hasPermission, setPermission } from '../../../lib/mockData.js'

/*  
    API GATEWAY (simulado)
  - EL UNICO QUE EL FRONTEND LLAMA...
  - LLAMA A MICROSERVICIOS
    - /api/auth -> IDENTIDAD
    - /api/externo/cedula -> VALIDA CEDULA
    - /api/expediente -> DATOS CLINICOS SI EL PACIENTE LO APRUEBA
  - USAREMOS MOCK DATA...
*/

export async function POST(request) {
  const trace = []
  try {
    const url = new URL(request.url)
    const origin = url.origin
    const body = await request.json()
    const action = body && body.action

    if (action === 'get_permission') {
      const { pacienteId } = body
      trace.push(`get_permission check for ${pacienteId}`)
      return NextResponse.json({ permission: hasPermission(pacienteId), trace })
    }

    if (action === 'grant_permission') {
      const { pacienteId } = body
      const value = typeof body.value === 'boolean' ? body.value : true
      trace.push('grant_permission start')
      trace.push('call /api/auth')
      const authRes = await fetch(`${origin}/api/auth`, { method: 'POST' })
      const authJson = await authRes.json()
      if (!authJson.success) {
        trace.push('auth failed')
        return NextResponse.json({ success: false, error: 'Autenticación fallida', trace }, { status: 401 })
      }
      trace.push('auth success')

      const newVal = setPermission(pacienteId, value)
      trace.push(`permission set to ${newVal}`)
      return NextResponse.json({ success: true, permission: newVal, trace })
    }

    if (action === 'request_expediente') {
      const { medicoCedula, pacienteId } = body
      trace.push('request_expediente start')

      trace.push('call /api/auth')
      const authRes = await fetch(`${origin}/api/auth`, { method: 'POST' })
      const authJson = await authRes.json()
      if (!authJson.success) {
        trace.push('auth failed')
        return NextResponse.json({ error: 'Autenticación fallida', trace }, { status: 401 })
      }
      trace.push('auth success')

      trace.push('call /api/externo/cedula')
      const cedulaRes = await fetch(`${origin}/api/externo/cedula`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula: medicoCedula })
      })
      const cedulaJson = await cedulaRes.json()
      if (!cedulaJson.valid) {
        trace.push('cedula invalid')
        return NextResponse.json({ error: 'Cédula inválida', trace }, { status: 400 })
      }
      trace.push('cedula valid')

      trace.push('check permission')
      if (!hasPermission(pacienteId)) {
        trace.push('no permission')
        return NextResponse.json({ error: 'Paciente no otorgó permiso', trace }, { status: 403 })
      }
      trace.push('permission ok')

      trace.push('call /api/expediente')
      const expedienteRes = await fetch(`${origin}/api/expediente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacienteId, validated: true })
      })
      const expedienteJson = await expedienteRes.json()
      trace.push('expediente fetched')
      return NextResponse.json({ expediente: expedienteJson, trace })
    }

    return NextResponse.json({ error: 'Acción no soportada' }, { status: 400 })
  } catch (e) {
    console.error('Gateway error:', e)
    return NextResponse.json({ error: 'Internal Server Error', detail: String(e && e.message), trace }, { status: 500 })
  }
}
