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
      localStorage.setItem('poc_user', JSON.stringify({ id: '1', nombre: 'Juan Pérez' }))
      setMessage('Inicio de sesión correcto. Redirigiendo al dashboard...')
      router.push('/pacientes/dashboard')
    } else {
      setMessage('Credenciales incorrectas. Usuario válido: Juan Pérez / 1234')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Portal Pacientes — Auth</h2>
      <div className="card">
        <p className="font-semibold">Login</p>

        <form onSubmit={handleLogin} className="mt-3">
          <label className="block mb-2">
            <span className="text-sm">Nombre de usuario</span>
            <input className="w-full border rounded p-2 mt-1" value={username} onChange={e => setUsername(e.target.value)} />
          </label>
          <label className="block mb-2">
            <span className="text-sm">Contraseña</span>
            <input type="password" className="w-full border rounded p-2 mt-1" value={password} onChange={e => setPassword(e.target.value)} />
          </label>

          <button className="px-4 py-2 bg-gov-navy text-white rounded" type="submit">Iniciar sesión</button>
        </form>

        {message && <p className="mt-3 text-green-600">{message}</p>}
      </div>
    </div>
  )
}
