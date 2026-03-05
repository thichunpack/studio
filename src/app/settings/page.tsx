
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
import { Save, ShieldAlert, Eye, Laptop, Smartphone, FileText, ShieldCheck } from "lucide-react"
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
    },
  })

  // Watch all fields for live preview
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
        description: result.message,
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
          <h1 className="text-xl font-bold font-headline uppercase italic text-white">Cài Đặt <span className="text-blue-500">Giao Diện</span></h1>
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
          <div className="flex h-full flex-col lg:flex-row">
            {/* Form Section */}
            <ScrollArea className="flex-1 p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto pb-20">
                  <Card className="bg-[#0d1117] border-slate-800 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-white text-lg italic flex items-center gap-2">
                        <Laptop className="h-5 w-5 text-blue-500" />
                        TÙY CHỈNH THÔNG SỐ
                      </CardTitle>
                      <CardDescription className="text-slate-500 italic">Thay đổi nội dung hiển thị trên trang xác minh.</CardDescription>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs uppercase text-slate-500">Tiêu Đề Chính</FormLabel>
                              <FormControl>
                                <Input className="bg-black border-slate-800 text-white" placeholder="Xác minh để tiếp tục" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="buttonText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs uppercase text-slate-500">Văn Bản Nút</FormLabel>
                              <FormControl>
                                <Input className="bg-black border-slate-800 text-white" placeholder="Tôi là con người (đồng ý)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase text-slate-500">Văn Bản Mô Tả</FormLabel>
                            <FormControl>
                              <Textarea
                                className="bg-black border-slate-800 text-white"
                                placeholder="Hãy giải quyết thử thách này..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fileName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs uppercase text-slate-500">Tên Tệp Mồi</FormLabel>
                              <FormControl>
                                <Input className="bg-black border-slate-800 text-white" placeholder="anh.png" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="fileInfo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs uppercase text-slate-500">Thông Tin Tệp</FormLabel>
                              <FormControl>
                                <Input className="bg-black border-slate-800 text-white" placeholder="1.2 MB - Ảnh an toàn" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase text-slate-500">URL Hình Ảnh Mồi</FormLabel>
                            <FormControl>
                              <Input className="bg-black border-slate-800 text-white font-mono text-xs" placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="redirectUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase text-slate-500">URL Chuyển Hướng Sau Xác Minh</FormLabel>
                            <FormControl>
                              <Input className="bg-black border-slate-800 text-green-500 font-mono text-xs" placeholder="https://google.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customHtml"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase text-slate-500">HTML Tùy Chỉnh (Nâng cao)</FormLabel>
                            <FormControl>
                              <Textarea
                                className="bg-black border-slate-800 text-blue-400 font-code text-[10px] min-h-[100px]"
                                placeholder="<p>Chào mừng bạn...</p>"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-[10px] italic">Mã này sẽ hiển thị ngay phía trên nút xác minh.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                        <ShieldAlert className="h-4 w-4 text-red-500" />
                        <AlertTitle className="text-red-500 italic text-[10px] font-black uppercase tracking-widest">CẢNH BÁO BẢO MẬT</AlertTitle>
                        <AlertDescription className="text-red-500/70 text-xs italic">
                          Việc sử dụng HTML tùy chỉnh có thể gây lỗi hiển thị nếu mã không chuẩn.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </ScrollArea>

            {/* Preview Section */}
            <div className="hidden lg:flex w-[450px] border-l border-slate-800 bg-black flex-col">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">LIVE PREVIEW</span>
                </div>
                <div className="flex bg-[#0d1117] rounded-lg p-1">
                  <button 
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-md transition-all ${previewDevice === "mobile" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white"}`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-md transition-all ${previewDevice === "desktop" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white"}`}
                  >
                    <Laptop className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden p-6 flex items-start justify-center bg-[#05070a]">
                <div className={`transition-all duration-500 shadow-[0_0_100px_rgba(59,130,246,0.1)] border border-slate-800 overflow-hidden ${previewDevice === "mobile" ? "w-[320px] h-[560px] rounded-[3rem]" : "w-full h-[400px] rounded-2xl"}`}>
                   <ScrollArea className="h-full bg-white">
                      {/* Mock Public UI */}
                      <div className={`p-6 text-center font-bold italic min-h-full flex flex-col items-center justify-center ${watchedValues.theme === 'dark' ? 'bg-zinc-950 text-white' : watchedValues.theme === 'forest' ? 'bg-green-50' : watchedValues.theme === 'sunset' ? 'bg-orange-50' : 'bg-white'}`}>
                        <Image 
                            src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
                            alt="Google" 
                            width={92} 
                            height={30} 
                            className="h-5 mx-auto mb-10 opacity-70"
                        />
                        
                        <div className="w-full">
                           <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 mb-6 overflow-hidden shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                              <div className="flex items-center gap-3 mb-4 text-left px-2">
                                  <FileText className="h-5 w-5 text-blue-500 opacity-60" />
                                  <span className="text-[10px] text-gray-400 uppercase truncate">{watchedValues.fileName}</span>
                              </div>
                              <div className="aspect-video w-full rounded-2xl overflow-hidden mb-2 relative bg-slate-100">
                                  {watchedValues.imageUrl ? (
                                    <img src={watchedValues.imageUrl} alt="Preview" className="object-cover w-full h-full grayscale opacity-50" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300">NO IMAGE</div>
                                  )}
                              </div>
                              <div className="text-[9px] text-gray-400 uppercase tracking-tighter text-left px-2">{watchedValues.fileInfo}</div>
                           </div>

                           <div className="mb-4">
                              <h2 className="text-sm uppercase mb-1">{watchedValues.title}</h2>
                              <p className="text-[10px] text-gray-400 uppercase normal-case font-normal leading-relaxed px-4">{watchedValues.description}</p>
                           </div>

                           {watchedValues.customHtml && (
                             <div className="text-[10px] mb-4 opacity-70 normal-case px-4" dangerouslySetInnerHTML={{ __html: watchedValues.customHtml }} />
                           )}

                           <button className="p-6 bg-white border border-gray-100 rounded-[30px] w-full shadow-lg text-[10px] uppercase flex justify-between items-center text-gray-700 hover:bg-gray-50 transition-all border-b-4 active:border-b-0 active:translate-y-1 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white">
                              <span>{watchedValues.buttonText}</span>
                              <Image src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" width={18} height={18} className="opacity-40" />
                           </button>

                           <div className="mt-8 flex items-center justify-center gap-2 text-gray-300">
                              <ShieldCheck className="h-3 w-3" />
                              <p className="text-[7px] uppercase tracking-tighter">Bảo mật bởi Sentinel Master v78</p>
                           </div>
                        </div>
                      </div>
                   </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
