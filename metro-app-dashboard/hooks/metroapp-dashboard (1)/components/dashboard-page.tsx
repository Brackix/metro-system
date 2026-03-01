"use client"

import { useState } from "react"
import { Activity, AlertTriangle, Building, Clock, CreditCard, MapPin, Menu, Train, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BankBranches } from "@/components/bank-branches"
import { MetroMap } from "@/components/metro-map"
import { MetroLineStatus } from "@/components/metro-line-status"
import { StationList } from "@/components/station-list"
import { UserDataGrid } from "@/components/user-data-grid"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <Train className="h-6 w-6" />
              <h1 className="text-xl font-bold">MetroApp</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
                  <Activity className="mr-2 h-4 w-4" />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "users"} onClick={() => setActiveTab("users")}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "stations"} onClick={() => setActiveTab("stations")}>
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>Stations</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "transactions"} onClick={() => setActiveTab("transactions")}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Transactions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "branches"} onClick={() => setActiveTab("branches")}>
                  <Building className="mr-2 h-4 w-4" />
                  <span>Branches</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">Metro Control</p>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1">
          <header className="border-b">
            <div className="flex h-16 items-center px-4 md:px-6">
              <Button variant="outline" size="icon" className="mr-4 md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
              <div className="ml-auto flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline-block">Live Updates</span>
                </Button>
              </div>
            </div>
          </header>
          <main className="grid flex-1 items-start gap-4 p-4 md:gap-8 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="stations">Stations</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="branches">Branches</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Trains</CardTitle>
                      <Train className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">42</div>
                      <p className="text-xs text-muted-foreground">+2 from last hour</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Passengers Today</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">245,678</div>
                      <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">On-Time Performance</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">94.2%</div>
                      <p className="text-xs text-muted-foreground">+0.5% from last week</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2</div>
                      <p className="text-xs text-muted-foreground">Minor delays on Red Line</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="lg:col-span-4">
                    <CardHeader>
                      <CardTitle>Metro Map</CardTitle>
                      <CardDescription>Live view of the metro system</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MetroMap />
                    </CardContent>
                  </Card>
                  <Card className="lg:col-span-3">
                    <CardHeader>
                      <CardTitle>Line Status</CardTitle>
                      <CardDescription>Current status of all metro lines</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MetroLineStatus />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage registered users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UserDataGrid />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="stations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Station Information</CardTitle>
                    <CardDescription>View all stations and their current status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StationList />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>View payment and ticket transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Transaction history coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="branches" className="space-y-4">
                <BankBranches />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
