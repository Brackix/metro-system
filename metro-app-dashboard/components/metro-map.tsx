"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { ZoomIn } from "lucide-react"

export function MetroMap() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="w-full h-[300px] bg-slate-50 rounded-md border relative overflow-hidden cursor-pointer group hover:bg-slate-100 transition-colors">
          <Image
            src="https://www.opret.gob.do/Images/Mapa%20Li%CC%81neas%20tarjeta%20-01.jpg"
            alt="Metro de Santo Domingo subway map showing Line 1 (North-South) and Line 2 (East-West) routes across the city"
            fill
            className="object-contain p-2"
            priority
          />
          <div className="absolute bottom-2 right-2 bg-white/80 text-xs px-2 py-1 rounded text-gray-700 flex items-center gap-1">
            <ZoomIn className="h-3 w-3" />
            Click para ampliar
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 [&>button]:text-white [&>button]:bg-red-500 [&>button]:hover:bg-red-600">
        <DialogTitle className="sr-only">Mapa del Metro de Santo Domingo</DialogTitle>
        <div className="relative w-full h-full min-h-[80vh]">
          <Image
            src="https://www.opret.gob.do/Images/Mapa%20Li%CC%81neas%20tarjeta%20-01.jpg"
            alt="Metro de Santo Domingo subway map showing Line 1 (North-South) and Line 2 (East-West) routes across the city"
            fill
            className="object-contain p-4"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
