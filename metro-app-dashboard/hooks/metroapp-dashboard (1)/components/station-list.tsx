"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function StationList() {
  const [searchQuery, setSearchQuery] = useState("")

  const stations = [
    {
      id: 1,
      name: "Central Station",
      lines: ["Red", "Blue", "Green"],
      status: "Open",
      accessibility: true,
      facilities: ["Elevator", "Restrooms", "Ticket Office", "Shops"],
    },
    {
      id: 2,
      name: "Airport Terminal",
      lines: ["Blue"],
      status: "Open",
      accessibility: true,
      facilities: ["Elevator", "Restrooms", "Ticket Office", "Luggage Storage"],
    },
    {
      id: 3,
      name: "City Hall",
      lines: ["Red"],
      status: "Open",
      accessibility: true,
      facilities: ["Elevator", "Restrooms", "Ticket Office"],
    },
    {
      id: 4,
      name: "Market Street",
      lines: ["Red"],
      status: "Partial Closure",
      accessibility: false,
      facilities: ["Ticket Office"],
    },
    {
      id: 5,
      name: "Riverside",
      lines: ["Red"],
      status: "Open",
      accessibility: true,
      facilities: ["Elevator", "Restrooms"],
    },
    {
      id: 6,
      name: "Business District",
      lines: ["Blue"],
      status: "Open",
      accessibility: true,
      facilities: ["Elevator", "Restrooms", "Ticket Office"],
    },
    {
      id: 7,
      name: "University",
      lines: ["Blue"],
      status: "Open",
      accessibility: true,
      facilities: ["Elevator", "Restrooms"],
    },
    {
      id: 8,
      name: "Sports Arena",
      lines: ["Blue"],
      status: "Open",
      accessibility: true,
      facilities: ["Elevator", "Restrooms", "Ticket Office"],
    },
    {
      id: 9,
      name: "West End",
      lines: ["Green"],
      status: "Open",
      accessibility: false,
      facilities: ["Ticket Office"],
    },
    {
      id: 10,
      name: "Park Avenue",
      lines: ["Green"],
      status: "Open",
      accessibility: true,
      facilities: ["Elevator", "Restrooms"],
    },
  ]

  const filteredStations = stations.filter((station) => station.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getLineColor = (line: string) => {
    switch (line) {
      case "Red":
        return "bg-red-500"
      case "Blue":
        return "bg-blue-500"
      case "Green":
        return "bg-green-500"
      case "Yellow":
        return "bg-yellow-500"
      case "Purple":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search stations..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Station Name</TableHead>
              <TableHead>Lines</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Facilities</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStations.map((station) => (
              <TableRow key={station.id}>
                <TableCell className="font-medium">{station.name}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {station.lines.map((line) => (
                      <div key={line} className={`w-4 h-4 rounded-full ${getLineColor(line)}`} title={`${line} Line`} />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={station.status === "Open" ? "outline" : "secondary"}
                    className={station.status === "Open" ? "text-green-500 border-green-500" : ""}
                  >
                    {station.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {station.facilities.slice(0, 2).map((facility) => (
                      <Badge key={facility} variant="secondary" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                    {station.facilities.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{station.facilities.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
