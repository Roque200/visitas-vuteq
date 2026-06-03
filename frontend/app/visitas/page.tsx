'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Visita {
  id: number
  nombreVisitante: string
  empresa: string
  personaVisitar: string
  fecha: string
  horaEntrada: string
  estatus: string
}

export default function VisitasPage() {
  const router = useRouter()
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [loading, setLoading] = useState(true)
  const [rol, setRol] = useState('')

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (u) setRol(JSON.parse(u).rol)
    cargarVisitas()
  }, [])

  const cargarVisitas = async () => {
    try {
      const res = await fetch(`/api/visitas`)
      const data = await res.json()
      setVisitas(data)
    } catch {
      console.error('Error al cargar visitas')
    } finally {
      setLoading(false)
    }
  }

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta visita?')) return
    try {
      const res = await fetch(`/api/visitas/${id}`, { method: 'DELETE' })
      if (res.ok) cargarVisitas()
      else alert('Error al eliminar.')
    } catch {
      alert('Error de conexión.')
    }
  }

  const colorEstatus = (estatus: string) => {
    if (estatus === 'Confirmada') return 'bg-green-100 text-green-700'
    if (estatus === 'Rechazada') return 'bg-red-100 text-red-700'
    if (estatus === 'Usada') return 'bg-gray-200 text-gray-600'
    return 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Listado de Visitas</h2>
        {rol === 'admin' && (
          <button onClick={() => router.push('/visitas/nueva')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 font-semibold">
            + Nueva Visita
          </button>
        )}
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
                <th className="px-4 py-3 text-left">Empresa</th>
                <th className="px-4 py-3 text-left">Fecha de Entrada</th>
                <th className="px-4 py-3 text-left">Solicitado por</th>
                <th className="px-4 py-3 text-left">Estatus</th>
                {rol === 'admin' && <th className="px-4 py-3 text-left">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {visitas.map((v, i) => (
                <tr key={v.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{i + 1}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{v.nombreVisitante}</td>
                  <td className="px-4 py-3 text-gray-800">{v.empresa}</td>
                  <td className="px-4 py-3 text-gray-800">{v.fecha} {v.horaEntrada}</td>
                  <td className="px-4 py-3 text-gray-800">{v.personaVisitar}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorEstatus(v.estatus)}`}>
                      {v.estatus}
                    </span>
                  </td>
                  {rol === 'admin' && (
                    <td className="px-4 py-3 flex gap-2">
                      {v.estatus === 'Pendiente' && (
                        <button onClick={() => router.push(`/visitas/confirmacion?id=${v.id}`)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-500">
                          Ver
                        </button>
                      )}
                      <button onClick={() => eliminar(v.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-500">
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {visitas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400">No hay visitas registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
