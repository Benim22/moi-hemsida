import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#e4d699] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Sidan hittades inte</h2>
        <p className="text-white/70 mb-8">
          Tyvärr kunde vi inte hitta sidan du letar efter.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center px-6 py-3 bg-[#e4d699] text-black rounded-lg hover:bg-[#e4d699]/90 transition-colors font-medium"
        >
          Tillbaka till startsidan
        </Link>
      </div>
    </div>
  )
} 