'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PacientesLogin() {
  const [username, setUsername] = useState('Juan Pérez')
  const [password, setPassword] = useState('1234')
  const [message, setMessage] = useState('')
  const router = useRouter()

  function handleLogin(e) {
    e.preventDefault()
    setMessage('')
    if (username === 'Juan Pérez' && password === '1234') {
      localStorage.setItem('poc_user', JSON.stringify({ id: '1', nombre: 'Juan Pérez', token: 'demo-token' }))
      setMessage('✓ Inicio de sesión correcto. Redirigiendo al dashboard...')
      setTimeout(() => {
        router.push('/pacientes/dashboard')
      }, 500)
    } else {
      setMessage('✗ Credenciales incorrectas. Usuario válido: Juan Pérez / 1234')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Portal Pacientes — Autenticación</h2>

      <div className="card">
        <p className="font-semibold mb-4">Iniciar Sesión</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Nombre de usuario</span>
            <input
              className="w-full border rounded p-2 mt-1"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Juan Pérez"
            />
          </label>
          
          <label className="block">
            <span className="text-sm font-medium">Contraseña</span>
            <input
              type="password"
              className="w-full border rounded p-2 mt-1"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="1234"
            />
          </label>

          <button
            className="px-4 py-2 bg-gov-navy text-white rounded hover:opacity-90 w-full font-medium"
            type="submit"
          >
            Iniciar sesión
          </button>
        </form>

        {message && (
          <p className={`mt-3 text-sm font-medium ${message.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500">
            <strong>Demo:</strong> Las credenciales son <code>Juan Pérez</code> / <code>1234</code>
          </p>
        </div>
      </div>

    </div>
  )
}
