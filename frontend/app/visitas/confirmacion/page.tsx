'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Visita {
  id: number
  nombreVisitante: string
  empresa: string
  personaVisitar: string
  fecha: string
  horaEntrada: string
  estatus: string
}

interface QRData {
  qrImageBase64: string
  nombreVisitante: string
  fecha: string
  horaEntrada: string
}

function ConfirmacionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [visita, setVisita] = useState<Visita | null>(null)
  const [qrData, setQrData] = useState<QRData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/visitas/${id}`)
      .then(r => r.json())
      .then(data => { setVisita(data); setLoading(false) })
  }, [id])

  const confirmar = async () => {
    const res = await fetch(`/api/visitas/${id}/confirmar`, { method: 'PUT' })
    if (res.ok) {
      const data = await res.json()
      setQrData(data)
    }
  }

  const rechazar = async () => {
    if (!confirm('¿Estás seguro de rechazar esta visita?')) return
    await fetch(`/api/visitas/${id}/rechazar`, { method: 'PUT' })
    router.push('/visitas')
  }

  if (loading) return <div className="p-6 text-gray-500">Cargando...</div>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirmación de Visita</h2>

        {visita && (
          <table className="w-full text-sm mb-6">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Nombre del Visitante</th>
                <th className="px-4 py-3 text-left">Empresa</th>
                <th className="px-4 py-3 text-left">Fecha de Entrada</th>
                <th className="px-4 py-3 text-left">Solicitado por</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3 text-gray-800">1</td>
                <td className="px-4 py-3 text-gray-800 font-medium">{visita.nombreVisitante}</td>
                <td className="px-4 py-3 text-gray-800">{visita.empresa}</td>
                <td className="px-4 py-3 text-gray-800">{visita.fecha} {visita.horaEntrada}</td>
                <td className="px-4 py-3 text-gray-800">{visita.personaVisitar}</td>
              </tr>
            </tbody>
          </table>
        )}

        {!qrData ? (
          <div className="flex gap-4 justify-center">
            <button onClick={confirmar}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-500">
              ✓ Confirmar Visita
            </button>
            <button onClick={rechazar}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-500">
              ✗ Rechazar Visita
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center mt-4 border rounded-xl p-6 bg-green-50 border-green-200">
            <div className="text-green-600 text-4xl mb-2">✓</div>
            <p className="font-semibold text-gray-800 mb-1">Visita confirmada</p>
            <p className="text-sm text-gray-500 mb-4">Muestra el siguiente código QR al guardia de seguridad</p>
            <img src={`data:image/png;base64,${qrData.qrImageBase64}`} alt="QR" className="w-40 h-40 mb-3" />
            <p className="text-sm text-gray-600">Tu visita es:</p>
            <p className="font-semibold text-gray-800">{qrData.fecha} {qrData.horaEntrada}</p>
            <button onClick={() => router.push('/visitas')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500">
              Aceptar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Cargando...</div>}>
      <ConfirmacionContent />
    </Suspense>
  )
}
