'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWebSocket } from '../../lib/useWebSocket'
import { ConnectionStatus } from '../../components/ConnectionStatus'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || '/api/gateway'

export default function PacientesDashboard() {
  const pacienteId = '1'
  const [permission, setPermission] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const router = useRouter()
  const { connected, addEvent } = useWebSocket()

  useEffect(() => {
    const raw = localStorage.getItem('poc_user')
    if (!raw) {
      router.push('/pacientes')
      return
    }
    setUser(JSON.parse(raw))
    addEvent('Sistema', 'Dashboard del paciente cargado', 'success')

    async function load() {
      addEvent('Gateway', 'Consultando permisos del paciente...', 'info')
      try {
        const res = await fetch(GATEWAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_permission', pacienteId })
        })
        const json = await res.json()
        setPermission(!!json.permission)
        addEvent('Gateway', `Permisos consultados: ${json.permission ? 'Activado' : 'Desactivado'}`, 'success')
      } catch (err) {
        addEvent('Error', `Error al consultar permisos: ${err.message}`, 'error')
      }
    }
    load()
  }, [addEvent])

  async function togglePermission() {
    if (!user) {
      setMessage('Debes iniciar sesión')
      return
    }
    setLoading(true)
    setMessage('')
    const serviceToken = user?.token || 'demo-token'
    const targetValue = !permission
    addEvent('Usuario', `${targetValue ? 'Intentando activar' : 'Intentando desactivar'} acceso...`, 'info')

    try {
      const res = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grant_permission', pacienteId, value: targetValue, token: serviceToken })
      })
      const data = await res.json()
      if (data.success) {
        setPermission(!!data.permission)
        setMessage(targetValue ? 'Acceso activado.' : 'Acceso desactivado.')
        addEvent('Gateway', `Acceso ${targetValue ? 'activado' : 'desactivado'}. Evento publicado en RabbitMQ.`, 'success')
      } else {
        const errMsg = data.error || 'Error al cambiar permiso.'
        setMessage(errMsg)
        addEvent('Error', errMsg, 'error')
      }
    } catch (err) {
      setMessage('Error de red.')
      addEvent('Error', `Error de red: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('poc_user')
    addEvent('Sistema', 'Sesión cerrada', 'info')
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
      
      <ConnectionStatus connected={connected} />

      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <p><strong>Nombre:</strong> {paciente.nombre}</p>
            <p><strong>Cédula:</strong> {paciente.cedula}</p>
            <p><strong>ID del paciente:</strong> {paciente.id}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="font-bold text-lg mb-3">Control de Acceso</p>
          <p className="text-gray-600 mb-4">Autoriza a profesionales de salud a acceder a tu expediente médico</p>

          <button
            onClick={togglePermission}
            disabled={loading}
            className={`px-4 py-2 text-white rounded disabled:opacity-50 ${permission ? 'bg-red-500 hover:bg-red-600' : 'bg-gov-navy hover:opacity-90'}`}
          >
            {loading ? 'Procesando...' : (permission ? 'Desactivar acceso' : 'Activar acceso')}
          </button>

          {message && (
            <p className={`mt-3 text-sm font-medium ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </div>
      </div>

    </div>
  )
}
