'use client'
import { useEffect, useState } from 'react'

interface Entrada {
  id: number
  visitaId: number
  nombreVisitante: string
  personaVisitar: string
  fechaEntrada: string
  fechaSalida: string | null
  estatus: string
}

export default function EntradasSalidasPage() {
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [loading, setLoading] = useState(true)

  const cargarEntradas = async () => {
    try {
      const res = await fetch(`/api/entradas`)
      const data = await res.json()
      setEntradas(data)
    } catch {
      console.error('Error al cargar entradas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarEntradas() }, [])

  const darSalida = async (id: number) => {
    if (!confirm('¿Registrar salida de este visitante?')) return
    await fetch(`/api/entradas/${id}/salida`, { method: 'PUT' })
    cargarEntradas()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Entradas y Salidas</h2>
        <button onClick={cargarEntradas}
          className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-500">
          Refrescar
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Nombre del Visitante</th>
                <th className="px-4 py-3 text-left">Fecha de Entrada</th>
                <th className="px-4 py-3 text-left">Fecha de Salida</th>
                <th className="px-4 py-3 text-left">Solicitado por</th>
                <th className="px-4 py-3 text-left">Estatus</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {entradas.map((e, i) => (
                <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{i + 1}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{e.nombreVisitante}</td>
                  <td className="px-4 py-3 text-gray-800">{e.fechaEntrada}</td>
                  <td className="px-4 py-3 text-gray-800">{e.fechaSalida ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-800">{e.personaVisitar}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${e.estatus === 'En planta' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                      {e.estatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {e.estatus === 'En planta' ? (
                      <button onClick={() => darSalida(e.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-500">
                        Dar Salida
                      </button>
                    ) : (
                      <span className="text-gray-500 text-xs">Salió</span>
                    )}
                  </td>
                </tr>
              ))}
              {entradas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400">No hay registros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
