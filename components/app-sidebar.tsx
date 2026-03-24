import * as React from "react"
import {
  Rocket,
  BarChart2,
  Database,
  Users,
  Globe,
  Hexagon,
  Activity,
  Zap,
  LayoutDashboard,
  ChevronsUpDown,
} from "lucide-react"

import { SearchForm } from "@/components/search-form"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { prisma } from "@/lib/prisma"

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // This is sample data combined with dynamic projects.
  const data = {
    navMain: [
      {
        title: "Menu",
        items: [
          {
            title: "Home",
            url: "/",
            icon: Rocket,
            isActive: true,
          },
          {
            title: "Projects",
            url: "/projects",
            icon: Database,
            subItems: projects.map(p => ({
              title: p.name,
              url: `/projects/${p.id}`
            }))
          },
          {
            title: "Workflows",
            url: "/workflows",
            icon: Activity,
          }
        ],
      }
    ],
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2 mt-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <LayoutDashboard className="size-4" />
          </div>
          <div className="flex flex-1 flex-col gap-0.5 leading-none">
            <span className="font-semibold text-base">ruleWorker</span>
          </div>
          <ChevronsUpDown className="size-4 opacity-50" />
        </div>
        <div className="px-2">
          <SearchForm />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subItem) => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton asChild isActive={subItem.isActive}>
                      <a href={subItem.url}>
                        <subItem.icon className="mr-2" />
                        <span>{subItem.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {subItem.subItems && subItem.subItems.length > 0 && (
                      <SidebarMenuSub>
                        {subItem.subItems.map((child) => (
                          <SidebarMenuSubItem key={child.url}>
                            <SidebarMenuSubButton asChild>
                              <a href={child.url}>
                                <span>{child.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

