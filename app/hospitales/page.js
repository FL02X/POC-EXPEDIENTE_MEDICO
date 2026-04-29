'use client'

import { useState } from 'react'

export default function HospitalesPage() {
  // PREFILL CON EJEMPLO...
  const [cedula, setCedula] = useState('87654321')
  const [pacienteId, setPacienteId] = useState('1')
  const [loading, setLoading] = useState(false)
  const [expediente, setExpediente] = useState(null)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setExpediente(null)
    try {
      const res = await fetch('/api/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_expediente', medicoCedula: cedula, pacienteId })
      })
      const data = await res.json()
      if (data.expediente) {
        setExpediente(data.expediente)
      } else {
        setError(data.error || 'No se obtuvo expediente.')
      }
    } catch (err) {
      setError('Error de red.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Portal Hospitales</h2>

      

      <div className="card">
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            <span className="text-sm">Cédula del médico</span>
            <input className="w-full border rounded p-2 mt-1" value={cedula} onChange={e => setCedula(e.target.value)} />
          </label>
          <label className="block mb-2">
            <span className="text-sm">ID del paciente</span>
            <input className="w-full border rounded p-2 mt-1" value={pacienteId} onChange={e => setPacienteId(e.target.value)} />
          </label>
          <button className="px-4 py-2 bg-gov-navy text-white rounded" type="submit" disabled={loading}>
            {loading ? 'Solicitando...' : 'Solicitar expediente'}
          </button>
        </form>

        {error && <p className="mt-3 text-red-600">{error}</p>}

        {expediente && (
          <table className="w-full mt-4 border-collapse">
            <tbody>
              <tr><td className="border p-2 font-semibold">Edad</td><td className="border p-2">{expediente.edad}</td></tr>
              <tr><td className="border p-2 font-semibold">Peso</td><td className="border p-2">{expediente.peso}</td></tr>
              <tr><td className="border p-2 font-semibold">Alergias</td><td className="border p-2">{expediente.alergias}</td></tr>
              <tr><td className="border p-2 font-semibold">Diagnósticos</td><td className="border p-2">{expediente.diagnosticos.join(', ')}</td></tr>
              <tr><td className="border p-2 font-semibold">Medicamentos</td><td className="border p-2">{expediente.medicamentos.join(', ')}</td></tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
