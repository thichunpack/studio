
"use client"

import * as React from "react"
import { 
  LayoutDashboard, 
  LogOut,
  Zap,
  FileKey2,
  Settings,
  ImageIcon,
  Link as LinkIcon,
  Send
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

const mainNav = [
  {
    title: "Tổng Quan",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý Link",
    url: "/links",
    icon: LinkIcon,
  },
  {
    title: "Trình Ghi Ảnh",
    url: "/image-logger",
    icon: ImageIcon,
  },
  {
    title: "Nhật Ký Live",
    url: "/admin",
    icon: FileKey2,
  },
]

const settingsNav = [
  {
    title: "Cấu hình Hệ thống",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-800 bg-[#05070a] text-slate-400">
      <SidebarHeader className="border-b border-slate-800/50 py-6">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-black text-sm tracking-tighter text-white italic">
              SENTINEL <span className="text-blue-500">MASTER</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Version 7.8.0</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase font-black text-slate-600 mb-2 px-2 group-data-[collapsible=icon]:hidden">Bảng điều khiển</SidebarGroupLabel>
          <SidebarMenu>
            {mainNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className={`mb-1 rounded-xl transition-all duration-200 ${
                    pathname === item.url 
                      ? "bg-blue-600/10 text-blue-500 font-bold" 
                      : "hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Link href={item.url}>
                    <item.icon className={pathname === item.url ? "text-blue-500" : ""} />
                    <span className="text-xs uppercase italic">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[10px] uppercase font-black text-slate-600 mb-2 px-2 group-data-[collapsible=icon]:hidden">Cài đặt & Bảo mật</SidebarGroupLabel>
          <SidebarMenu>
            {settingsNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className={`mb-1 rounded-xl transition-all duration-200 ${
                    pathname === item.url 
                      ? "bg-blue-600/10 text-blue-500 font-bold" 
                      : "hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Link href={item.url}>
                    <item.icon className={pathname === item.url ? "text-blue-500" : ""} />
                    <span className="text-xs uppercase italic">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-800/50 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-slate-500 hover:text-red-500 transition-colors rounded-xl">
              <Link href="/login">
                <LogOut className="h-4 w-4" />
                <span className="text-xs uppercase italic font-bold">Đăng Xuất</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
