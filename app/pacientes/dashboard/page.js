'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PacientesDashboard() {
  const pacienteId = '1'
  const [permission, setPermission] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const raw = localStorage.getItem('poc_user')
    if (!raw) {
      router.push('/pacientes')
      return
    }
    setUser(JSON.parse(raw))

    async function load() {
      try {
        const res = await fetch('/api/gateway', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_permission', pacienteId })
        })
        const json = await res.json()
        setPermission(!!json.permission)
      } catch (err) {
      }
    }
    load()
  }, [])

  async function togglePermission() {
    if (!user) {
      setMessage('Debes iniciar sesión')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grant_permission', pacienteId, value: !permission })
      })
      const data = await res.json()
      if (data.success) {
        setPermission(!!data.permission)
        setMessage(data.permission ? 'Acceso activado.' : 'Acceso desactivado.')
      } else {
        setMessage(data.error || 'Error al cambiar permiso.')
      }
    } catch (err) {
      setMessage('Error de red.')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('poc_user')
    router.push('/pacientes')
  }

  const paciente = {
    id: '1',
    nombre: 'Juan Pérez',
    cedula: '12345678'
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Portal Pacientes — Dashboard</h2>

      <div className="card mb-4">
        <p className="font-semibold">Sesión</p>
        <p className="small-muted">Usuario: <strong>{user?.nombre}</strong></p>
        <div className="mt-3 flex gap-2">
          <button className="px-3 py-1 bg-gray-300 rounded" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>

      <div className="card">
        <p><strong>Nombre:</strong> {paciente.nombre}</p>
        <p className="small-muted"><strong>Cédula:</strong> {paciente.cedula}</p>
        <p className="small-muted"><strong>ID del paciente:</strong> {paciente.id} (usar este ID en Portal Hospitales)</p>

        <div className="mt-4">
          <button
            className="px-4 py-2 rounded text-white"
            onClick={togglePermission}
            disabled={loading}
            style={{ background: permission ? '#ef4444' : '#0b3d91' }}
          >
            {loading ? 'Procesando...' : (permission ? 'Desactivar acceso' : 'Activar acceso')}
          </button>
        </div>

        {message && <p className="mt-3 text-green-600">{message}</p>}
      </div>
    </div>
  )
}
