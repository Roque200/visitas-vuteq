'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'

interface Resultado {
  success: boolean
  nombreVisitante?: string
  message?: string
}

export default function CasetaPage() {
  const router = useRouter()
  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [loading, setLoading] = useState(false)
  const [camaraActiva, setCamaraActiva] = useState(false)
  const html5QrRef = useRef<Html5Qrcode | null>(null)

  const verificar = async (codigoQR: string) => {
    if (!codigoQR.trim()) return
    setLoading(true)
    setResultado(null)
    try {
      const res = await fetch(`/api/visitas/escanear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigoQR.trim() })
      })
      const data = await res.json()
      setResultado(data)
    } catch {
      setResultado({ success: false, message: 'Error de conexión con el servidor.' })
    } finally {
      setLoading(false)
    }
  }

  const iniciarCamara = async () => {
    try {
      const html5Qr = new Html5Qrcode('qr-reader')
      html5QrRef.current = html5Qr
      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await detenerCamara()
          setCodigo(decodedText)
          await verificar(decodedText)
        },
        () => {}
      )
      setCamaraActiva(true)
    } catch {
      setResultado({ success: false, message: 'No se pudo acceder a la cámara.' })
    }
  }

  const detenerCamara = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop()
        html5QrRef.current = null
      } catch {}
    }
    setCamaraActiva(false)
  }

  useEffect(() => {
    return () => { detenerCamara() }
  }, [])

  const resetear = () => {
    setCodigo('')
    setResultado(null)
  }

  return (
    <div className="p-6 max-w-lg mx-auto mt-6">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Escanear QR visita</h2>

        <div className="mb-4">
          <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
          {!camaraActiva ? (
            <button onClick={iniciarCamara}
              className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 mb-4">
              📷 Escanear con cámara
            </button>
          ) : (
            <button onClick={detenerCamara}
              className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-500 mb-4 mt-2">
              ✕ Detener cámara
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">o ingresa el código</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <input
          className="w-full border-2 border-blue-400 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          placeholder="Pegar o escanear con pistola QR..."
          value={codigo}
          onChange={e => setCodigo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && verificar(codigo)}
        />

        <button onClick={() => verificar(codigo)} disabled={loading}
          className="w-full bg-blue-900 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 mb-6">
          {loading ? 'Verificando...' : 'Verificar'}
        </button>

        {resultado && (
          <div className={`rounded-xl p-6 flex flex-col items-center ${resultado.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className={`text-5xl mb-3 ${resultado.success ? 'text-green-500' : 'text-red-500'}`}>
              {resultado.success ? '✓' : '✗'}
            </div>
            <p className={`font-semibold text-lg mb-1 ${resultado.success ? 'text-green-700' : 'text-red-700'}`}>
              {resultado.success ? 'QR escaneado correctamente' : 'Acceso denegado'}
            </p>
            <p className="text-gray-600 text-sm text-center">
              {resultado.success
                ? `${resultado.nombreVisitante} ya se encuentra en lista de entradas y salidas.`
                : resultado.message}
            </p>
            <div className="flex gap-3 mt-4">
              <button onClick={resetear}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 text-sm">
                Aceptar
              </button>
              {resultado.success && (
                <button onClick={() => router.push('/entradas-salidas')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 text-sm">
                  Ver Entradas
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
