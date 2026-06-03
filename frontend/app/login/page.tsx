'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!usuario || !password) {
      setError('Por favor ingresa usuario y contraseña.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
      })
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('usuario', JSON.stringify(data))
        if (data.rol === 'caseta') {
          router.push('/caseta')
        } else {
          router.push('/visitas')
        }
      } else {
        setError('Usuario o contraseña incorrectos.')
      }
    } catch {
      setError('Error de conexión con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-blue-900 mb-1">VUTEQ</h1>
        <h2 className="text-base font-semibold text-gray-700 mb-6 text-center">Sistema de Visitas</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            autoComplete="username"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <div className="relative">
            <input
              type={verPassword ? 'text' : 'password'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setVerPassword(!verPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            >
              {verPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </div>
    </div>
  )
}
