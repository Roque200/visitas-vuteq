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

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1"

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Formulario de Visitas</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelClass}>Nombre del Visitante *</label>
            <input name="nombreVisitante" value={form.nombreVisitante} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Empresa</label>
            <input name="empresa" value={form.empresa} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Persona a Visitar *</label>
            <input name="personaVisitar" value={form.personaVisitar} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Motivo</label>
            <textarea name="motivo" value={form.motivo} onChange={handleChange} rows={2} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fecha *</label>
            <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Hora Entrada *</label>
            <input type="time" name="horaEntrada" value={form.horaEntrada} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Identificación Oficial</label>
            <input name="identificacion" value={form.identificacion} onChange={handleChange} placeholder="Número de identificación" className={inputClass} />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        <button onClick={handleSubmit} disabled={loading}
          className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-500 disabled:opacity-50">
          {loading ? 'Guardando...' : 'Solicitar Visita'}
        </button>
      </div>
    </div>
  )
}
