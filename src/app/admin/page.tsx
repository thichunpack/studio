
"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, RefreshCw, Download, Trash2, MapPin, ShieldAlert, ShieldCheck, ExternalLink, Info } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { getDashboardStatsAction, deleteLogsAction, type RecentLog } from "@/app/actions/logs"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
  const [logs, setLogs] = React.useState<RecentLog[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [autoRefresh, setAutoRefresh] = React.useState(true)
  const [selectedMap, setSelectedMap] = React.useState<{link: string, addr: string} | null>(null)
  const [selectedIp, setSelectedIp] = React.useState<string | null>(null)
  const [ipInfo, setIpInfo] = React.useState<any>(null)
  const { toast } = useToast()

  const fetchLogs = React.useCallback(async () => {
    const result = await getDashboardStatsAction()
    if (result.success) {
      setLogs(result.data.recentLogs)
    }
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    fetchLogs()
    let interval: any
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000)
    }
    return () => clearInterval(interval)
  }, [fetchLogs, autoRefresh])

  const checkIP = async (ip: string) => {
    setSelectedIp(ip)
    setIpInfo(null)
    try {
        const res = await fetch(`https://ipapi.co/${ip}/json/`)
        const data = await res.json()
        setIpInfo(data)
    } catch (e) {
        toast({ variant: "destructive", title: "Lỗi", description: "Không thể lấy thông tin IP." })
    }
  }

  const handleDelete = async () => {
    if (confirm("Xóa tất cả nhật ký?")) {
      setIsDeleting(true)
      const result = await deleteLogsAction()
      if (result.success) {
        toast({ title: "Thành công", description: result.message })
        fetchLogs()
      }
      setIsDeleting(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#05070a]">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-800 px-4 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <SidebarTrigger />
          <h1 className="text-xl font-bold font-headline text-white italic">SENTINEL <span className="text-blue-500">MASTER</span></h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant={autoRefresh ? "secondary" : "outline"} size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} /> 
              {autoRefresh ? "Auto Live" : "Manual"}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/api/logs/download" download="tracking_logs.txt">
                <Download className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Tải về</span>
              </a>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          <Card className="bg-[#0d1117] border-slate-800 shadow-2xl">
            <CardHeader className="border-b border-slate-800/50">
              <CardTitle className="text-white text-sm uppercase tracking-widest flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Dữ liệu truy cập chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="min-w-[1000px]">
                  <table className="w-full text-left font-mono">
                    <thead className="bg-black text-slate-500 text-[10px] uppercase sticky top-0">
                      <tr>
                        <th className="p-4">Thời gian</th>
                        <th className="p-4">IP (Intelligence)</th>
                        <th className="p-4">Bảo mật</th>
                        <th className="p-4">Vị trí & Địa chỉ</th>
                        <th className="p-4 text-right">Bản đồ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-400 text-xs">
                      {logs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-blue-500/5 transition-all group">
                          <td className="p-4">
                            <span className="text-white">{log.timestamp.split(',')[1]}</span>
                            <br />
                            <span className="text-[10px] opacity-50">{log.timestamp.split(',')[0]}</span>
                          </td>
                          <td className="p-4">
                            <button onClick={() => checkIP(log.ip)} className="text-blue-400 font-bold hover:underline">
                              {log.ip}
                            </button>
                            <br />
                            <span className="text-[10px] opacity-60 italic">{log.isp}</span>
                          </td>
                          <td className="p-4">
                            {log.fraud === 'Sạch' ? (
                                <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5">
                                    <ShieldCheck className="h-3 w-3 mr-1" /> {log.fraud}
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-red-500 border-red-500/20 bg-red-500/5">
                                    <ShieldAlert className="h-3 w-3 mr-1" /> {log.fraud}
                                </Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="text-slate-300 font-sans italic-none normal-case leading-relaxed max-w-md">
                                {log.address}
                            </div>
                            {log.coordinates !== 'N/A' && (
                                <div className="text-green-500/70 text-[10px] mt-1">
                                    GPS: {log.coordinates} (±{log.accuracy}m)
                                </div>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {log.mapLink !== 'N/A' && (
                                <Button size="sm" variant="outline" className="h-8 border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white" onClick={() => setSelectedMap({link: log.mapLink, addr: log.address})}>
                                    <MapPin className="h-3 w-3 mr-1" /> Xem tại chỗ
                                </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </main>

        {/* Map Dialog */}
        <Dialog open={!!selectedMap} onOpenChange={() => setSelectedMap(null)}>
          <DialogContent className="max-w-4xl bg-black border-slate-800 p-0 overflow-hidden">
            <DialogHeader className="p-4 border-b border-slate-800">
              <DialogTitle className="text-white text-sm flex items-center justify-between">
                <span>LIVE MAP PREVIEW</span>
                <a href={selectedMap?.link} target="_blank" className="text-blue-500 hover:underline flex items-center gap-1">
                  Google Maps <ExternalLink className="h-3 w-3" />
                </a>
              </DialogTitle>
            </DialogHeader>
            <div className="aspect-video w-full">
              <iframe 
                src={`${selectedMap?.link.replace('https://www.google.com/maps?q=', 'https://www.google.com/maps?q=')}&output=embed&z=15`}
                className="w-full h-full border-none invert grayscale contrast-[1.2]"
              />
            </div>
            <div className="p-4 bg-zinc-900 text-xs text-slate-400 italic font-sans">
                {selectedMap?.addr}
            </div>
          </DialogContent>
        </Dialog>

        {/* IP Intelligence Dialog */}
        <Dialog open={!!selectedIp} onOpenChange={() => setSelectedIp(null)}>
          <DialogContent className="max-w-md bg-[#0d1117] border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-blue-500">IP INTELLIGENCE: {selectedIp}</DialogTitle>
            </DialogHeader>
            {ipInfo ? (
                <div className="space-y-4 text-sm font-mono text-slate-300 mt-4">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500">Quốc gia:</span>
                        <span>{ipInfo.country_name} ({ipInfo.country_code})</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500">Thành phố:</span>
                        <span>{ipInfo.city}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500">Nhà mạng (ISP):</span>
                        <span>{ipInfo.org}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-500">Bảo mật:</span>
                        <span className={ipInfo.proxy ? "text-red-500" : "text-green-500"}>
                            {ipInfo.proxy ? "VPN/Proxy Phát hiện" : "IP Sạch"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Múi giờ:</span>
                        <span>{ipInfo.timezone}</span>
                    </div>
                </div>
            ) : (
                <div className="py-10 text-center text-slate-500">Đang truy xuất dữ liệu...</div>
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
