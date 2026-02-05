"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, RefreshCw, Download, Trash2, Copy } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { getLogContentAction, deleteLogsAction } from "@/app/actions/logs"
import { useToast } from "@/hooks/use-toast"

export default function AdminPage() {
  const [logContent, setLogContent] = React.useState("")
  const [isInitialLoading, setIsInitialLoading] = React.useState(true)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [autoRefresh, setAutoRefresh] = React.useState(true)
  const { toast } = useToast()

  const fetchLogs = React.useCallback(async () => {
    try {
      const content = await getLogContentAction()
      setLogContent(content)
    } catch (e) {
      setLogContent("Không thể tải nhật ký.")
    } finally {
      if (isInitialLoading) {
        setIsInitialLoading(false)
      }
    }
  }, [isInitialLoading])

  React.useEffect(() => {
    fetchLogs()
    let interval: any
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000)
    }
    return () => clearInterval(interval)
  }, [fetchLogs, autoRefresh])

  const handleDownload = () => {
    const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tracking_logs.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    if (!logContent) return;
    navigator.clipboard.writeText(logContent).then(() => {
      toast({
        title: "Đã sao chép!",
        description: "Nội dung nhật ký đã được sao chép.",
      })
    })
  }

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả nhật ký truy cập không? Hành động này không thể hoàn tác.")) {
      setIsDeleting(true)
      const result = await deleteLogsAction()
      if (result.success) {
        toast({
          title: "Thành công",
          description: result.message,
        })
        await fetchLogs()
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: result.message,
        })
      }
      setIsDeleting(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-xl font-bold font-headline">Nhật ký truy cập</h1>
          <div className="ml-auto flex items-center gap-2">
             <Button 
              variant={autoRefresh ? "secondary" : "outline"} 
              size="sm" 
              className="gap-2"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} /> 
              {autoRefresh ? "Tự động làm mới" : "Làm mới thủ công"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={isInitialLoading || !logContent}>
              <Copy className="h-4 w-4" />
               <span className="ml-2 hidden sm:inline">Sao chép</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={isInitialLoading || !logContent}>
              <Download className="h-4 w-4" />
               <span className="ml-2 hidden sm:inline">Tải xuống</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
              <Trash2 className="h-4 w-4" />
               <span className="ml-2 hidden sm:inline">Xóa Nhật ký</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  logs/tracking_logs.txt
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[65vh] rounded-md border bg-muted/20 p-4 font-code">
                <pre className="text-sm text-foreground whitespace-pre-wrap">
                  {isInitialLoading ? "Đang tải nhật ký..." : logContent}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
