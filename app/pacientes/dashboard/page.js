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

  async function activate() {
    if (!user) {
      setMessage('Debes iniciar sesión')
      return
    }
    if (permission) {
      setMessage('El acceso ya está activado.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grant_permission', pacienteId, value: true })
      })
      const data = await res.json()
      if (data.success) {
        setPermission(!!data.permission)
        setMessage('Acceso activado.')
      } else {
        setMessage(data.error || 'Error al activar permiso.')
      }
    } catch (err) {
      setMessage('Error de red.')
    } finally {
      setLoading(false)
    }
  }

  async function deactivate() {
    if (!user) {
      setMessage('Debes iniciar sesión')
      return
    }
    if (!permission) {
      setMessage('El acceso ya está desactivado.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grant_permission', pacienteId, value: false })
      })
      const data = await res.json()
      if (data.success) {
        setPermission(!!data.permission)
        setMessage('Acceso desactivado.')
      } else {
        setMessage(data.error || 'Error al desactivar permiso.')
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

      <div className="card">
        <p><strong>Nombre:</strong> {paciente.nombre}</p>
        <p className=""><strong>Cédula:</strong> {paciente.cedula}</p>
        <p className=""><strong>ID del paciente:</strong> {paciente.id} (usar este ID en Portal Hospitales)</p>

        <p className="" style={{ marginTop: '20px' }}><strong>CONTROL DE ACCESO AL DOCTOR DE TU EXPEDIENTE MEDICO:</strong></p>

        <div style={{ marginTop: '6px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="checkbox"
              checked={permission}
              onChange={togglePermission}
              disabled={loading}
              style={{ width: '20px', height: '20px', cursor: loading ? 'not-allowed' : 'pointer' }}
            />
            <span style={{ fontWeight: '700', color: permission ? '#0b3d91' : '#666666' }}>
              {permission ? 'Acceso activo' : 'Acceso inactivo'}
            </span>
          </label>
        </div>

        {message && <p className="mt-3 text-green-600">{message}</p>}
      </div>
    </div>
  )
}
