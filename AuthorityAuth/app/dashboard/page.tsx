"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,_var(--border)_1px,_transparent_1px),_linear-gradient(to_bottom,_var(--border)_1px,_transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />

      {/* Header */}
      <header className="relative border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Disaster Management</h1>
              <p className="text-xs text-muted-foreground">Authority Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Authority Account</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <LayoutDashboard className="w-10 h-10 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">Dashboard Coming Soon</CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  The authority dashboard is under development
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-6 rounded-xl bg-muted/30 border border-border/50 text-center">
                <p className="text-muted-foreground">
                  Welcome, <span className="text-foreground font-medium">{user?.email}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  You have successfully logged in to the Authority Portal.
                  The dashboard features will be available soon.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Reports", value: "Coming Soon" },
                  { label: "Alerts", value: "Coming Soon" },
                  { label: "Analytics", value: "Coming Soon" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-4 rounded-lg bg-muted/20 border border-border/30 text-center"
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-medium text-foreground mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
