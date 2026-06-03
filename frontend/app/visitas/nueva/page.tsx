'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevaVisitaPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nombreVisitante: '',
    empresa: '',
    personaVisitar: '',
    motivo: '',
    fecha: '',
    horaEntrada: '',
    identificacion: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.nombreVisitante || !form.personaVisitar || !form.fecha || !form.horaEntrada) {
      setError('Por favor completa los campos obligatorios.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/visitas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreVisitante: form.nombreVisitante,
          empresa: form.empresa,
          personaVisitar: form.personaVisitar,
          motivo: form.motivo,
          fecha: form.fecha,
          horaEntrada: form.horaEntrada + ':00',
          identificacion: form.identificacion
        })
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/visitas/confirmacion?id=${data.id}`)
      } else {
        setError('Error al guardar la visita.')
      }
    } catch {
      setError('Error de conexión con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">VUTEQ — Sistema de Visitas</h1>
        <button onClick={() => router.push('/visitas')} className="bg-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-600">
          ← Regresar
        </button>
      </div>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Formulario de Visitas</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre del Visitante *</label>
              <input name="nombreVisitante" value={form.nombreVisitante} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Empresa</label>
              <input name="empresa" value={form.empresa} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Persona a Visitar *</label>
              <input name="personaVisitar" value={form.personaVisitar} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Motivo</label>
              <textarea name="motivo" value={form.motivo} onChange={handleChange} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha *</label>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Hora Entrada *</label>
              <input type="time" name="horaEntrada" value={form.horaEntrada} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Identificación Oficial</label>
              <input name="identificacion" value={form.identificacion} onChange={handleChange}
                placeholder="Número de identificación"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          <button onClick={handleSubmit} disabled={loading}
            className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-500 disabled:opacity-50">
            {loading ? 'Guardando...' : 'Solicitar Visita'}
          </button>
        </div>
      </div>
    </div>
  )
}
