'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, HardDrive, RotateCcw, Server } from "lucide-react"

export default function SystemHealthPage() {
  const handleReset = async () => {
    if (confirm("This will reset all demo data to the initial seed state. Photos will be deleted. Continue?")) {
      const res = await fetch('/api/reset', { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      } else {
        alert("Failed to reset demo data")
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">System Health</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Monitor platform performance and data usage.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Storage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.2 MB</div>
            <p className="text-xs text-muted-foreground">
              Across all schemas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128 MB</div>
            <p className="text-xs text-muted-foreground">
              Originals & thumbnails
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Latency</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">42ms</div>
            <p className="text-xs text-muted-foreground">
              P95 response time
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive bg-destructive/5 mt-8">
        <CardHeader>
          <CardTitle className="text-destructive">Demo Management</CardTitle>
          <CardDescription>
            Dangerous actions that affect the entire demo workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="text-sm max-w-xl">
              <strong>Reset Workspace</strong>
              <p className="text-muted-foreground mt-1">
                This will delete all current records, purge uploaded photos, and re-seed the database with the initial demo dataset. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" onClick={handleReset} className="shrink-0 gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset Demo Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
