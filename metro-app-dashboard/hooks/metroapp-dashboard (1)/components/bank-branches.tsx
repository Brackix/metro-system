"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample bank branch data for Dominican Republic
const branches = [
  {
    id: 1,
    name: "Santo Domingo Central",
    location: "Av. Winston Churchill, Santo Domingo",
    manager: "Carlos Mendez",
    staff: 24,
    status: "Active",
    transactionVolume: "High",
  },
  {
    id: 2,
    name: "Santiago Principal",
    location: "Av. 27 de Febrero, Santiago",
    manager: "Maria Rodriguez",
    staff: 18,
    status: "Active",
    transactionVolume: "Medium",
  },
  {
    id: 3,
    name: "Punta Cana Resort",
    location: "Bávaro, Punta Cana",
    manager: "Jose Ramirez",
    staff: 12,
    status: "Active",
    transactionVolume: "High",
  },
  {
    id: 4,
    name: "La Romana",
    location: "Av. Santa Rosa, La Romana",
    manager: "Ana Castillo",
    staff: 10,
    status: "Active",
    transactionVolume: "Medium",
  },
  {
    id: 5,
    name: "Puerto Plata",
    location: "Calle Duarte, Puerto Plata",
    manager: "Roberto Sanchez",
    staff: 8,
    status: "Maintenance",
    transactionVolume: "Low",
  },
  {
    id: 6,
    name: "San Francisco de Macorís",
    location: "Calle El Carmen, San Francisco",
    manager: "Luisa Hernandez",
    staff: 7,
    status: "Active",
    transactionVolume: "Low",
  },
]

// Sample transaction history data
const transactions = [
  {
    id: 1,
    branchId: 1,
    date: "2023-05-15",
    type: "Deposit",
    amount: 25000,
    customer: "Empresas Nacionales S.A.",
    status: "Completed",
  },
  {
    id: 2,
    branchId: 1,
    date: "2023-05-15",
    type: "Withdrawal",
    amount: 12000,
    customer: "Miguel Fernandez",
    status: "Completed",
  },
  {
    id: 3,
    branchId: 2,
    date: "2023-05-15",
    type: "Transfer",
    amount: 35000,
    customer: "Constructora Dominicana",
    status: "Completed",
  },
  {
    id: 4,
    branchId: 3,
    date: "2023-05-14",
    type: "Deposit",
    amount: 50000,
    customer: "Hotel Caribe Resort",
    status: "Completed",
  },
  {
    id: 5,
    branchId: 1,
    date: "2023-05-14",
    type: "Loan Payment",
    amount: 8500,
    customer: "Sofia Morales",
    status: "Completed",
  },
  {
    id: 6,
    branchId: 4,
    date: "2023-05-14",
    type: "Transfer",
    amount: 15000,
    customer: "Exportadora del Este",
    status: "Completed",
  },
  {
    id: 7,
    branchId: 2,
    date: "2023-05-13",
    type: "Withdrawal",
    amount: 7500,
    customer: "Eduardo Perez",
    status: "Completed",
  },
  {
    id: 8,
    branchId: 3,
    date: "2023-05-13",
    type: "Deposit",
    amount: 42000,
    customer: "Inversiones Turísticas",
    status: "Completed",
  },
]

// Branch stories/highlights
const branchStories = [
  {
    id: 1,
    branchId: 1,
    title: "Community Financial Education Program",
    description:
      "Santo Domingo Central branch launched a financial literacy program that has reached over 5,000 local residents, helping improve financial awareness in the community.",
    impact: "High",
    date: "March 2023",
  },
  {
    id: 2,
    branchId: 3,
    title: "Tourism Sector Support Initiative",
    description:
      "Punta Cana branch developed specialized financial products for local tourism businesses, contributing to a 15% growth in the sector.",
    impact: "High",
    date: "January 2023",
  },
  {
    id: 3,
    branchId: 2,
    title: "Agricultural Financing Program",
    description:
      "Santiago branch provided over 200 loans to small farmers in the region, supporting sustainable agricultural practices and local food production.",
    impact: "Medium",
    date: "April 2023",
  },
  {
    id: 4,
    branchId: 4,
    title: "Small Business Recovery Support",
    description:
      "La Romana branch implemented a special program to help small businesses recover from pandemic impacts, with flexible payment terms and reduced interest rates.",
    impact: "Medium",
    date: "February 2023",
  },
]

export function BankBranches() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("branches")

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Branches</CardTitle>
            <CardDescription>Active branches across Dominican Republic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.length}</div>
            <p className="text-xs text-muted-foreground">5 provinces covered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Transactions</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">+12% from previous month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>Total amount processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RD$ 195,000</div>
            <p className="text-xs text-muted-foreground">+8% from previous month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branch Success Stories</CardTitle>
          <CardDescription>Recent initiatives and community impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {branchStories.map((story) => {
              const branch = branches.find((b) => b.id === story.branchId)
              return (
                <div key={story.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg">{story.title}</h3>
                    <Badge variant={story.impact === "High" ? "default" : "outline"}>{story.impact} Impact</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{story.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-medium">{branch?.name}</span>
                    <span className="text-sm text-muted-foreground">{story.date}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Branch Information & Transactions</CardTitle>
              <CardDescription>View branch details and transaction history</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="branches">Branches</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="branches">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transaction Volume</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBranches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell>{branch.location}</TableCell>
                        <TableCell>{branch.manager}</TableCell>
                        <TableCell>{branch.staff}</TableCell>
                        <TableCell>
                          <Badge
                            variant={branch.status === "Active" ? "outline" : "secondary"}
                            className={branch.status === "Active" ? "border-green-500 text-green-500" : ""}
                          >
                            {branch.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              branch.transactionVolume === "High"
                                ? "bg-green-100 text-green-800"
                                : branch.transactionVolume === "Medium"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }
                          >
                            {branch.transactionVolume}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="transactions">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount (RD$)</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => {
                      const branch = branches.find((b) => b.id === transaction.branchId)
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{branch?.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{transaction.type}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{transaction.amount.toLocaleString()}</TableCell>
                          <TableCell>{transaction.customer}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-green-500 text-green-500">
                              {transaction.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
