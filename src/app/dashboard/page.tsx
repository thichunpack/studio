"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Users, Globe, MapPin, MapPinOff, RefreshCw } from "lucide-react"
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getDashboardStatsAction, type DashboardStats, type RecentLog } from "@/app/actions/logs";

export default function DashboardPage() {
  const [statsData, setStatsData] = React.useState<DashboardStats>({
      totalVisits: 0,
      uniqueIps: 0,
      recentLogs: []
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchStats = React.useCallback(async () => {
      const result = await getDashboardStatsAction();
      if(result.success) {
          setStatsData(result.data);
      }
      setIsLoading(false);
  }, []);

  React.useEffect(() => {
      fetchStats();
      const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
  }, [fetchStats]);

  const statsCards = [
      { title: "Tổng Lượt Truy Cập", value: statsData.totalVisits.toLocaleString(), icon: Users },
      { title: "IP Duy Nhất", value: statsData.uniqueIps.toLocaleString(), icon: Globe },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-xl font-bold font-headline">Tổng quan</h1>
        </header>

        <main className="flex-1 p-6">
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tổng Lượt Truy Cập</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">...</div></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">IP Duy Nhất</CardTitle><Globe className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">...</div></CardContent></Card>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {statsCards.map((stat) => (
                        <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                            {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            
            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Hoạt động Gần đây</CardTitle>
                        <CardDescription>Hiển thị 12 lượt truy cập gần nhất (tự động làm mới).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && statsData.recentLogs.length === 0 ? (
                           <div className="text-center py-24 text-muted-foreground">
                             <RefreshCw className="mx-auto h-8 w-8 animate-spin" />
                             <p className="mt-4">Đang tải hoạt động...</p>
                           </div>
                        ) : statsData.recentLogs.length > 0 ? (
                           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {statsData.recentLogs.map((log, index) => (
                              <Card key={index} className="flex flex-col text-sm shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                  <CardDescription className="flex justify-between items-center text-xs">
                                    <span>{log.timestamp}</span>
                                    {log.type === 'Ảnh' && <Badge variant="secondary">Ảnh</Badge>}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-3">
                                  <div className="space-y-1">
                                      <p className="text-muted-foreground text-xs">Thiết bị</p>
                                      <p className="font-medium truncate leading-tight">{log.device}</p>
                                  </div>
                                  <div className="space-y-1">
                                      <p className="text-muted-foreground text-xs">Địa chỉ</p>
                                      <p className="font-medium leading-tight">{log.address}</p>
                                  </div>
                                  {log.ip !== 'N/A' && (
                                     <div className="space-y-1">
                                      <p className="text-muted-foreground text-xs">Địa chỉ IP</p>
                                      <p className="font-mono text-xs">{log.ip}</p>
                                    </div>
                                  )}
                                </CardContent>
                                <CardFooter>
                                  {log.mapLink !== 'N/A' ? (
                                    <Button variant="outline" size="sm" asChild className="w-full">
                                        <Link href={log.mapLink} target="_blank" rel="noopener noreferrer">
                                            <MapPin className="h-3 w-3 mr-2" />
                                            Xem trên Bản đồ
                                        </Link>
                                    </Button>
                                  ) : (
                                     <Button variant="outline" size="sm" className="w-full" disabled>
                                        <MapPinOff className="h-3 w-3 mr-2" />
                                        Vị trí không có sẵn
                                    </Button>
                                  )}
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-24 text-muted-foreground">
                            Chưa có hoạt động nào được ghi lại.
                          </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
