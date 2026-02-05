"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ImageLoggerPage() {
  const { toast } = useToast()
  const [imageUrl, setImageUrl] = React.useState("")

  React.useEffect(() => {
      // This will only run on the client side to ensure the correct domain is used.
      const domain = window.location.origin
      setImageUrl(`${domain}/api/image-track`)
  }, [])

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Đã sao chép!",
        description: "Nội dung đã được sao chép vào bộ nhớ tạm.",
      })
    })
  }

  const imageTag = `<img src="${imageUrl}" width="1" height="1" alt="" />`
  const markdownTag = `![tracking](${imageUrl})`

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-xl font-bold font-headline">Trình Ghi Ảnh Ẩn</h1>
        </header>
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Liên kết Theo dõi Ảnh</CardTitle>
                <CardDescription>
                  Gửi URL hoặc nhúng hình ảnh này vào email, trang web hoặc tin nhắn để ghi lại IP của người xem.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-url">URL Hình ảnh Theo dõi</Label>
                  <div className="flex gap-2">
                    <Input id="image-url" value={imageUrl} readOnly placeholder="Đang tạo liên kết..." />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(imageUrl)} disabled={!imageUrl}>
                      <Copy />
                      Sao chép
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-tag">Thẻ HTML để Nhúng</Label>
                   <div className="flex gap-2">
                    <Input id="image-tag" value={imageTag} readOnly className="font-code text-xs" placeholder="Đang tạo liên kết..."/>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(imageTag)} disabled={!imageUrl}>
                      <Copy />
                      Sao chép
                    </Button>
                  </div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="markdown-tag">Thẻ Markdown</Label>
                   <div className="flex gap-2">
                    <Input id="markdown-tag" value={markdownTag} readOnly className="font-code text-xs" placeholder="Đang tạo liên kết..."/>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(markdownTag)} disabled={!imageUrl}>
                      <Copy />
                      Sao chép
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 !text-amber-500" />
              <AlertTitle>Lưu ý Quan trọng</AlertTitle>
              <AlertDescription>
                Phương pháp này chỉ có thể ghi lại địa chỉ IP và thông tin thiết bị. Nó không thể lấy tọa độ GPS chính xác như trang xác minh chính. Vị trí được ghi lại sẽ là ước tính dựa trên địa chỉ IP của người xem.
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
