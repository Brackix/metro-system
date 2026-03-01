"use client"

import Image from "next/image"

export function MetroMap() {
  return (
    <div className="w-full h-[300px] bg-slate-50 rounded-md border relative overflow-hidden">
      <Image
        src="/placeholder.svg?height=600&width=800"
        alt="Metro de Santo Domingo subway map showing Line 1 (North-South) and Line 2 (East-West) routes across the city"
        fill
        className="object-contain p-2"
        priority
      />
      <div className="absolute bottom-2 right-2 bg-white/80 text-xs px-2 py-1 rounded text-gray-700">
        Metro de Santo Domingo
      </div>
    </div>
  )
}
