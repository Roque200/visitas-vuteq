'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Usuario {
  usuario: string
  rol: string
}

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (u) setUsuario(JSON.parse(u))
  }, [])

  const logout = () => {
    localStorage.removeItem('usuario')
    router.push('/login')
  }

  const isAdmin = usuario?.rol === 'admin'

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer hover:bg-blue-700 transition-colors ${pathname === path ? 'bg-blue-700' : ''}`

  return (
    <div className="w-52 min-h-screen bg-blue-900 text-white flex flex-col flex-shrink-0">
      <div className="px-4 py-4 border-b border-blue-700">
        <div className="flex items-center gap-2 font-bold text-lg cursor-pointer"
          onClick={() => router.push(isAdmin ? '/visitas' : '/caseta')}>
           VUTEQ - Visitas
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {isAdmin && (
          <>
            <p className="text-xs text-blue-300 uppercase font-semibold px-3 mb-2">Administrador</p>
            <div className={linkClass('/visitas')} onClick={() => router.push('/visitas')}>
               Lista de visitas
            </div>
            <div className={linkClass('/visitas/nueva')} onClick={() => router.push('/visitas/nueva')}>
               Agregar visita
            </div>
          </>
        )}

        <p className="text-xs text-blue-300 uppercase font-semibold px-3 mt-4 mb-2">Caseta</p>
        <div className={linkClass('/caseta')} onClick={() => router.push('/caseta')}>
           Escanear QR
        </div>
        <div className={linkClass('/entradas-salidas')} onClick={() => router.push('/entradas-salidas')}>
           Entradas y Salidas
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-blue-700">
        <p className="text-xs text-blue-300 mb-2">{usuario?.usuario} — {usuario?.rol}</p>
        <button onClick={logout} className="w-full text-left text-sm text-blue-200 hover:text-white flex items-center gap-2">
           Logout
        </button>
      </div>
    </div>
  )
}
