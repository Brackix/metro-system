"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: number
  name: string
  email: string
  role: string
  status: string
  lastActive: string
  metroCard: string
  password?: string
}

type AuthContextType = {
  user: User | null
  login: (name: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("metroapp-auth-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (name: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    try {
      // Special case for Roebrt with hardcoded credentials
      if (name.toLowerCase() === "admin" && password === "admin") {
        // Create Roebrt user if it doesn't exist in localStorage
        const roebrtUser = {
          id: 9,
          name: "Admin",
          email: "admin@example.com",
          role: "Admin",
          status: "Active",
          lastActive: new Date().toLocaleString(),
          metroCard: "Gold",
          password: "admin",
        }

        // Set the logged in user
        setUser(roebrtUser)
        localStorage.setItem("metroapp-auth-user", JSON.stringify(roebrtUser))

        // Update users in localStorage if they exist
        const usersJson = localStorage.getItem("metroapp-users")
        if (usersJson) {
          const users = JSON.parse(usersJson)
          const existingUserIndex = users.findIndex((u: User) => u.name.toLowerCase() === "roebrt")

          if (existingUserIndex >= 0) {
            // Update existing Roebrt user
            users[existingUserIndex] = { ...users[existingUserIndex], lastActive: new Date().toLocaleString() }
          } else {
            // Add Roebrt user if not exists
            users.push(roebrtUser)
          }

          localStorage.setItem("metroapp-users", JSON.stringify(users))
        }

        setIsLoading(false)
        return true
      }

      // For other users, check localStorage
      const usersJson = localStorage.getItem("metroapp-users")
      if (!usersJson) {
        setIsLoading(false)
        return false
      }

      const users = JSON.parse(usersJson)
      const foundUser = users.find((u: User) => u.name.toLowerCase() === name.toLowerCase())

      if (foundUser && foundUser.status === "Active") {
        // Update last active time
        const updatedUser = {
          ...foundUser,
          lastActive: new Date().toLocaleString(),
        }

        // Update the user in localStorage
        const updatedUsers = users.map((u: User) => (u.id === foundUser.id ? updatedUser : u))
        localStorage.setItem("metroapp-users", JSON.stringify(updatedUsers))

        // Set the logged in user
        setUser(updatedUser)
        localStorage.setItem("metroapp-auth-user", JSON.stringify(updatedUser))

        setIsLoading(false)
        return true
      }

      setIsLoading(false)
      return false
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("metroapp-auth-user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
