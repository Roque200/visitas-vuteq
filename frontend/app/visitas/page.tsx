'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'

interface Visita {
  id: number
  nombreVisitante: string
  empresa: string
  personaVisitar: string
  fecha: string
  horaEntrada: string
  estatus: string
}

interface Reporte {
  nombreVisitante: string
  empresa: string
  fechaEntrada: string
  fechaSalida: string
  solicitadoPor: string
}

export default function VisitasPage() {
  const router = useRouter()
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [loading, setLoading] = useState(true)
  const [rol, setRol] = useState('')

  // Filtros
  const [tipoFiltro, setTipoFiltro] = useState<'rango' | 'dia' | 'mes'>('rango')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [diaEspecifico, setDiaEspecifico] = useState('')
  const [mes, setMes] = useState('')
  const [anio, setAnio] = useState(new Date().getFullYear().toString())
  const [exportando, setExportando] = useState(false)

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

  const exportarExcel = async () => {
    setExportando(true)
    try {
      let url = '/api/reportes/visitas?'
      if (tipoFiltro === 'rango' && desde && hasta) {
        url += `desde=${desde}&hasta=${hasta}`
      } else if (tipoFiltro === 'dia' && diaEspecifico) {
        url += `fecha=${diaEspecifico}`
      } else if (tipoFiltro === 'mes' && mes && anio) {
        url += `mes=${mes}&anio=${anio}`
      } else {
        alert('Por favor selecciona un filtro válido.')
        setExportando(false)
        return
      }

      const res = await fetch(url)
      const data: Reporte[] = await res.json()

      if (data.length === 0) {
        alert('No hay registros para el período seleccionado.')
        setExportando(false)
        return
      }

      // Formatear datos para Excel
      const filas = data.map((r, i) => ({
        '#': i + 1,
        'Nombre del Visitante': r.nombreVisitante,
        'Empresa': r.empresa,
        'Fecha de Entrada': r.fechaEntrada,
        'Fecha de Salida': r.fechaSalida,
        'Solicitado por': r.solicitadoPor
      }))

      const worksheet = XLSX.utils.json_to_sheet(filas)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitas')

      // Ajustar ancho de columnas
      worksheet['!cols'] = [
        { wch: 5 },
        { wch: 30 },
        { wch: 25 },
        { wch: 20 },
        { wch: 20 },
        { wch: 25 }
      ]

      const nombreArchivo = `Reporte_Visitas_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, nombreArchivo)
    } catch {
      alert('Error al generar el reporte.')
    } finally {
      setExportando(false)
    }
  }

  const colorEstatus = (estatus: string) => {
    if (estatus === 'Confirmada') return 'bg-green-100 text-green-700'
    if (estatus === 'Rechazada') return 'bg-red-100 text-red-700'
    if (estatus === 'Usada') return 'bg-gray-200 text-gray-600'
    return 'bg-yellow-100 text-yellow-700'
  }

  const meses = [
    { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' }, { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
  ]

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

      {/* Panel de filtros y exportación */}
      {rol === 'admin' && (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Exportar reporte a Excel</h3>

          {/* Selector tipo de filtro */}
          <div className="flex gap-2 mb-3">
            <button onClick={() => setTipoFiltro('rango')}
              className={`px-3 py-1 rounded text-sm font-medium ${tipoFiltro === 'rango' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Rango de fechas
            </button>
            <button onClick={() => setTipoFiltro('dia')}
              className={`px-3 py-1 rounded text-sm font-medium ${tipoFiltro === 'dia' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Día específico
            </button>
            <button onClick={() => setTipoFiltro('mes')}
              className={`px-3 py-1 rounded text-sm font-medium ${tipoFiltro === 'mes' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Por mes
            </button>
          </div>

          {/* Filtro rango */}
          {tipoFiltro === 'rango' && (
            <div className="flex gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Desde</label>
                <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Hasta</label>
                <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800" />
              </div>
              <button onClick={exportarExcel} disabled={exportando}
                className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-green-500 disabled:opacity-50 flex items-center gap-2">
                {exportando ? 'Generando...' : '📥 Exportar Excel'}
              </button>
            </div>
          )}

          {/* Filtro día específico */}
          {tipoFiltro === 'dia' && (
            <div className="flex gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Fecha</label>
                <input type="date" value={diaEspecifico} onChange={e => setDiaEspecifico(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800" />
              </div>
              <button onClick={exportarExcel} disabled={exportando}
                className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-green-500 disabled:opacity-50 flex items-center gap-2">
                {exportando ? 'Generando...' : '📥 Exportar Excel'}
              </button>
            </div>
          )}

          {/* Filtro por mes */}
          {tipoFiltro === 'mes' && (
            <div className="flex gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Mes</label>
                <select value={mes} onChange={e => setMes(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800">
                  <option value="">Seleccionar</option>
                  {meses.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Año</label>
                <input type="number" value={anio} onChange={e => setAnio(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 w-24" />
              </div>
              <button onClick={exportarExcel} disabled={exportando}
                className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-green-500 disabled:opacity-50 flex items-center gap-2">
                {exportando ? 'Generando...' : '📥 Exportar Excel'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabla de visitas */}
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
