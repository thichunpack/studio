
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
import { PlusCircle, Copy, Eye, Trash2, Link as LinkIcon, RefreshCw, Smartphone, Monitor } from "lucide-react"

const formSchema = z.object({
  id: z.string().optional(),
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
  const [origin, setOrigin] = React.useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      title: "",
      description: "",
      imageUrl: "",
      redirectUrl: "",
    },
  })

  const watchedValues = form.watch();

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
    // Safe access to window.location.origin on the client
    setOrigin(window.location.origin.replace('http://', '').replace('https://', ''))
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
        description: result.message || "Không thể tạo link.",
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
            <h1 className="text-xl font-bold font-headline uppercase italic">Quản lý <span className="text-blue-500">Chiến dịch</span></h1>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="icon" onClick={fetchLinks} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
             </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tạo Link Mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[900px] bg-[#0d1117] border-slate-800 text-slate-300 p-0 overflow-hidden">
                <div className="flex flex-col md:flex-row h-full">
                    <div className="flex-1 p-6 border-r border-slate-800">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-white italic uppercase">Thiết lập chiến dịch</DialogTitle>
                            <DialogDescription className="text-slate-500">
                                Nhập thông tin mồi để tạo link bẫy (OG Meta).
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase text-slate-500">Mã ID (Tùy chọn)</FormLabel>
                                    <FormControl><Input placeholder="VD: can-bo-01" className="bg-black border-slate-800 text-blue-500 font-mono" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )} />
                                <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase text-slate-500">Tiêu đề mồi</FormLabel>
                                    <FormControl><Input placeholder="VD: Tài liệu quan trọng" className="bg-black border-slate-800 text-white" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )} />
                                <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase text-slate-500">Mô tả mồi</FormLabel>
                                    <FormControl><Textarea placeholder="VD: Mô tả ngắn gọn về tài liệu..." className="bg-black border-slate-800 text-white" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )} />
                                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase text-slate-500">URL Hình ảnh mồi</FormLabel>
                                    <FormControl><Input placeholder="https://..." className="bg-black border-slate-800 text-white font-mono text-xs" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )} />
                                <FormField control={form.control} name="redirectUrl" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs uppercase text-slate-500">Link đích (Redirect)</FormLabel>
                                    <FormControl><Input placeholder="https://..." className="bg-black border-slate-800 text-green-500 font-mono text-xs" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )} />
                                <DialogFooter className="pt-4">
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? "Đang xử lý..." : "LƯU CHIẾN DỊCH"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>

                    <div className="w-full md:w-[350px] bg-black p-6 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 to-transparent">
                        <div className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-6 flex items-center gap-2">
                            <Smartphone className="h-3 w-3 text-blue-500" /> TRÌNH MÔ PHỎNG (ZALO/FB)
                        </div>
                        <div className="w-full bg-[#0d1117] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
                            {watchedValues.imageUrl ? (
                                <div className="aspect-video w-full bg-slate-900 overflow-hidden relative">
                                    <img src={watchedValues.imageUrl} className="object-cover w-full h-full" alt="Preview" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                            ) : (
                                <div className="aspect-video w-full bg-slate-900 flex items-center justify-center text-[10px] text-slate-700">CHƯA CÓ ẢNH</div>
                            )}
                            <div className="p-4 space-y-2">
                                <div className="text-xs font-bold text-white uppercase truncate">{watchedValues.title || "Tiêu đề mồi..."}</div>
                                <div className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{watchedValues.description || "Mô tả nội dung mồi của bạn tại đây để tăng tỷ lệ nhấp..."}</div>
                                <div className="text-[9px] text-blue-500 font-mono truncate pt-2 border-t border-slate-800/50">{origin}</div>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center gap-4 text-slate-600">
                             <Monitor className="h-4 w-4" />
                             <div className="h-4 w-px bg-slate-800" />
                             <Smartphone className="h-4 w-4 text-blue-500" />
                        </div>
                    </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        <main className="flex-1 p-6">
          <div className="rounded-2xl border border-slate-800 bg-[#0d1117] overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-black">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[100px] text-[9px] uppercase font-black text-slate-500">ID</TableHead>
                  <TableHead className="text-[9px] uppercase font-black text-slate-500">Chiến dịch / Nội dung mồi</TableHead>
                  <TableHead className="text-[9px] uppercase font-black text-slate-500">Link Đích</TableHead>
                  <TableHead className="text-right text-[9px] uppercase font-black text-slate-500">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center h-48 italic text-slate-500">Đang truy xuất dữ liệu...</TableCell></TableRow>
                ) : links.length > 0 ? (
                  links.map((link) => (
                    <TableRow key={link.id} className="border-slate-800 hover:bg-blue-500/5 transition-all">
                      <TableCell className="font-mono text-blue-500 text-xs font-bold">{link.id}</TableCell>
                      <TableCell>
                        <div className="font-bold text-white uppercase italic text-xs">{link.title}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-md italic">{link.description}</div>
                      </TableCell>
                      <TableCell>
                        <a href={link.redirectUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-500 hover:underline truncate block max-w-xs">{link.redirectUrl}</a>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-500" onClick={() => handleCopy(link.id)}><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => handleTest(link.id)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(link.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-slate-900 rounded-full">
                          <LinkIcon className="h-10 w-10 text-slate-700"/>
                        </div>
                        <p className="text-slate-500 italic text-sm">Chưa có chiến dịch nào được khởi tạo.</p>
                        <Button variant="outline" className="border-blue-500/30 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl" onClick={() => setIsModalOpen(true)}>
                          Bắt đầu chiến dịch đầu tiên
                        </Button>
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
