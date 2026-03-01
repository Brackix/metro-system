"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Sample user data
const users = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    role: "Admin",
    status: "Active",
    lastActive: "Today at 2:34 PM",
    metroCard: "Gold",
  },
  {
    id: 2,
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    role: "User",
    status: "Active",
    lastActive: "Today at 10:15 AM",
    metroCard: "Standard",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.b@example.com",
    role: "User",
    status: "Inactive",
    lastActive: "Yesterday at 4:45 PM",
    metroCard: "Standard",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "Staff",
    status: "Active",
    lastActive: "Today at 9:30 AM",
    metroCard: "Silver",
  },
  {
    id: 5,
    name: "James Wilson",
    email: "james.w@example.com",
    role: "User",
    status: "Active",
    lastActive: "Today at 1:20 PM",
    metroCard: "Standard",
  },
  {
    id: 6,
    name: "Olivia Martinez",
    email: "olivia.m@example.com",
    role: "User",
    status: "Active",
    lastActive: "Yesterday at 11:05 AM",
    metroCard: "Gold",
  },
  {
    id: 7,
    name: "Daniel Taylor",
    email: "daniel.t@example.com",
    role: "Staff",
    status: "Inactive",
    lastActive: "3 days ago",
    metroCard: "Silver",
  },
  {
    id: 8,
    name: "Sophia Anderson",
    email: "sophia.a@example.com",
    role: "User",
    status: "Active",
    lastActive: "Today at 8:45 AM",
    metroCard: "Standard",
  },
]

export function UserDataGrid() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Metro Card</TableHead>
              <TableHead>Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      user.role === "Admin"
                        ? "border-blue-500 text-blue-500"
                        : user.role === "Staff"
                          ? "border-purple-500 text-purple-500"
                          : "border-slate-500 text-slate-500"
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === "Active" ? "outline" : "secondary"}
                    className={user.status === "Active" ? "border-green-500 text-green-500" : ""}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      user.metroCard === "Gold"
                        ? "bg-amber-100 text-amber-800"
                        : user.metroCard === "Silver"
                          ? "bg-slate-100 text-slate-800"
                          : "bg-gray-100 text-gray-800"
                    }
                  >
                    {user.metroCard}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
