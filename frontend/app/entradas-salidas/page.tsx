'use client'
import { useEffect, useState, useRef } from 'react'

interface Entrada {
  id: number
  visitaId: number
  nombreVisitante: string
  empresa: string
  personaVisitar: string
  fechaEntrada: string
  fechaSalida: string | null
  estatus: string
}

interface Visita {
  id: number
  nombreVisitante: string
  empresa: string
  personaVisitar: string
  fecha: string
  horaEntrada: string
  estatus: string
}

export default function EntradasSalidasPage() {
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [proximasVisitas, setProximasVisitas] = useState<Visita[]>([])
  const [loading, setLoading] = useState(true)
  const [ultimaActualizacion, setUltimaActualizacion] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const cargarEntradas = async () => {
    try {
      const res = await fetch(`/api/entradas`)
      const data = await res.json()
      setEntradas(data)
    } catch {
      console.error('Error al cargar entradas')
    }
  }

  const cargarProximasVisitas = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0]
      const res = await fetch(`/api/visitas`)
      const data = await res.json()
      const visitasHoy = data.filter((v: Visita) => {
        const partes = v.fecha.split('/')
        const fechaVisita = `${partes[2]}-${partes[1]}-${partes[0]}`
        return fechaVisita === hoy && v.estatus !== 'Usada'
      })
      setProximasVisitas(visitasHoy)
      setUltimaActualizacion(new Date().toLocaleTimeString())
    } catch {
      console.error('Error al cargar próximas visitas')
    } finally {
      setLoading(false)
    }
  }

  const programarSiguienteRefresh = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    const ahora = new Date()
    const minutos = ahora.getMinutes()
    const segundos = ahora.getSeconds()
    const milisegundos = ahora.getMilliseconds()
    const minutosParaSiguiente = 15 - (minutos % 15)
    const msParaSiguiente = (minutosParaSiguiente * 60 - segundos) * 1000 - milisegundos
    timeoutRef.current = setTimeout(() => {
      cargarProximasVisitas()
      cargarEntradas()
      programarSiguienteRefresh()
    }, msParaSiguiente)
  }

  useEffect(() => {
    cargarEntradas()
    cargarProximasVisitas()
    programarSiguienteRefresh()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const darSalida = async (id: number) => {
    if (!confirm('¿Registrar salida de este visitante?')) return
    await fetch(`/api/entradas/${id}/salida`, { method: 'PUT' })
    cargarEntradas()
  }

  const colorEstatus = (estatus: string) => {
    if (estatus === 'Confirmada') return 'bg-green-100 text-green-700'
    if (estatus === 'Rechazada') return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div className="p-6">

      {/* Tabla Entradas y Salidas */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Entradas y Salidas</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Nombre del Visitante</th>
                <th className="px-4 py-3 text-left">Empresa</th>
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
                  <td className="px-4 py-3 text-gray-800">{e.empresa}</td>
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
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-400">No hay registros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla Próximas Visitas del Día */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Próximas Visitas del Día</h2>
            {ultimaActualizacion && (
              <p className="text-xs text-gray-400 mt-1">Última actualización: {ultimaActualizacion}</p>
            )}
          </div>
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
                  <th className="px-4 py-3 text-left">Hora de Entrada</th>
                  <th className="px-4 py-3 text-left">Solicitado por</th>
                  <th className="px-4 py-3 text-left">Estatus</th>
                </tr>
              </thead>
              <tbody>
                {proximasVisitas.map((v, i) => (
                  <tr key={v.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{i + 1}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{v.nombreVisitante}</td>
                    <td className="px-4 py-3 text-gray-800">{v.empresa}</td>
                    <td className="px-4 py-3 text-gray-800">{v.horaEntrada}</td>
                    <td className="px-4 py-3 text-gray-800">{v.personaVisitar}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorEstatus(v.estatus)}`}>
                        {v.estatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {proximasVisitas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No hay visitas programadas para hoy.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}