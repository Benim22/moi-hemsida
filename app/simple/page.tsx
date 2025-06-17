"use client"

import { useState } from "react"

export default function SimplePage() {
  const [count, setCount] = useState(0)

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen bg-gradient-to-b from-black via-black to-gray-900">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Enkel Test Sida</h1>
        
        <div className="bg-black/50 border border-[#e4d699]/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Detta är en test</h2>
          
          <p className="mb-4">Om du kan se denna text fungerar applikationen grundläggande.</p>
          
          <div className="space-y-4">
            <p>Räknare: {count}</p>
            <button 
              onClick={() => setCount(count + 1)}
              className="bg-[#e4d699] text-black px-4 py-2 rounded hover:bg-[#e4d699]/90"
            >
              Öka räknare
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 