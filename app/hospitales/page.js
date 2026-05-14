'use client'

import { useEffect, useState } from 'react'
import { useWebSocket } from '../lib/useWebSocket'
import { ConnectionStatus } from '../components/ConnectionStatus'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || '/api/gateway'

export default function HospitalesPage() {
  const [cedula, setCedula] = useState('87654321')
  const [pacienteId, setPacienteId] = useState('1')
  const [loading, setLoading] = useState(false)
  const [expediente, setExpediente] = useState(null)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState(null)
  const { connected, addEvent, lastPermissionUpdate } = useWebSocket()

  useEffect(() => {
    addEvent('Sistema', 'Portal Hospitales cargado', 'success')
  }, [addEvent])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setExpediente(null)
    addEvent('Usuario', `Solicitando expediente del paciente ${pacienteId}...`, 'info')
    
    try {
      const res = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_expediente', medicoCedula: cedula, pacienteId })
      })
      const data = await res.json()
      if (data.expediente) {
        setExpediente(data.expediente)
        addEvent('Gateway', `Expediente obtenido exitosamente`, 'success')
      } else {
        const errMsg = data.error || 'No se obtuvo expediente.'
        setError(errMsg)
        addEvent('Error', errMsg, 'error')
      }
    } catch (err) {
      setError('Error de red.')
      addEvent('Error', `Error de red: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  
  useEffect(() => {
    if (!lastPermissionUpdate) return
    try {
      const { action, pacienteId: pid } = lastPermissionUpdate
      if (action === 'revoked' && String(pid) === String(pacienteId)) {
        // If we have the expediente open for this paciente, remove it
        if (expediente) {
          setExpediente(null)
          addEvent('Sistema', `El acceso del paciente ${pid} fue revocado — expediente cerrado`, 'warning')
          setNotification({ message: `El paciente ${pid} revocó el acceso. Expediente cerrado.`, type: 'warning' })
        } else {
          addEvent('Sistema', `El acceso del paciente ${pid} fue revocado`, 'info')
          setNotification({ message: `El paciente ${pid} revocó el acceso.`, type: 'info' })
        }
      }
    } catch (err) {
      console.warn('Error handling permission update:', err)
    }
  }, [lastPermissionUpdate])

  useEffect(() => {
    if (!notification) return
    const id = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(id)
  }, [notification])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Portal Hospitales</h2>

      <ConnectionStatus connected={connected} />

      <div className="card">
        <div className={`mb-4 transition transform duration-300 ${notification ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
          {notification && (
            <div className={`p-3 rounded border ${notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
              <div className="flex items-center gap-3">
                <div className="font-semibold">Notificación</div>
                <div className="text-sm">{notification.message}</div>
              </div>
            </div>
          )}
        </div>
        <p className="font-semibold mb-3">Solicitar Expediente Médico</p>
        <p className="text-gray-600 text-sm mb-4">
          Ingresa tu cédula profesional y el ID del paciente cuyo expediente deseas consultar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Cédula del médico</span>
            <input
              className="w-full border rounded p-2 mt-1"
              value={cedula}
              onChange={e => setCedula(e.target.value)}
              placeholder="Ej: 87654321"
            />
          </label>
          
          <label className="block">
            <span className="text-sm font-medium">ID del paciente</span>
            <input
              className="w-full border rounded p-2 mt-1"
              value={pacienteId}
              onChange={e => setPacienteId(e.target.value)}
              placeholder="Ej: 1"
            />
          </label>
          
          <button
            className="px-4 py-2 bg-gov-navy text-white rounded disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Solicitando...' : 'Solicitar expediente'}
          </button>
        </form>

        {error && <p className="mt-3 text-red-600 font-medium">{error}</p>}

        {expediente && (
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-bold text-lg mb-3">📋 Expediente Médico</h3>
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border p-2 font-semibold bg-gray-100">Edad</td>
                  <td className="border p-2">{expediente.edad} años</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border p-2 font-semibold bg-gray-100">Peso</td>
                  <td className="border p-2">{expediente.peso}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border p-2 font-semibold bg-gray-100">Alergias</td>
                  <td className="border p-2">{expediente.alergias}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border p-2 font-semibold bg-gray-100">Diagnósticos</td>
                  <td className="border p-2">{expediente.diagnosticos.join(', ')}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border p-2 font-semibold bg-gray-100">Medicamentos</td>
                  <td className="border p-2">{expediente.medicamentos.join(', ')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
