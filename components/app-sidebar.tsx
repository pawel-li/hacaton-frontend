import * as React from "react"
import {
  Rocket,
  Database,
  Activity,
  LayoutDashboard,
  ChevronsUpDown,
  Folder,
  FolderOpen,
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

type SidebarTreeItem = {
  title: string
  url?: string
  items?: SidebarTreeItem[]
  count?: number
}

const vividFolderPalette = ["#283618", "#bc6c25", "#432818", "#f7b32b", "#2d1e2f"]

const folderColorByName: Record<string, string> = {
  datasets: vividFolderPalette[0],
  rules: vividFolderPalette[1],
  monitor: vividFolderPalette[2],
}

const getFolderColor = (title: string) => folderColorByName[title.toLowerCase()] ?? vividFolderPalette[3]

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const projectTreeItems: SidebarTreeItem[] = projects.map((project) => {
    const datasets = [
      {
        title: "weather.csv",
        url: `/projects/${project.id}/datasets/weather.csv`
      }
    ]
    const rules = [
      {
        title: "weather.csv",
        url: `/projects/${project.id}/rules/weather.csv`
      }
    ]
    return {
      title: project.name,
      items: [
        {
          title: "datasets",
          count: datasets.length,
          items: datasets
        },
        {
          title: "rules",
          count: rules.length,
          items: rules
        },
      {
        title: "monitor",
        items: [
          {
            title: "timeline",
            url: `/projects/${project.id}/monitor/timeline`
          },
          {
            title: "settings",
            url: `/projects/${project.id}/monitor/settings`
          },
          {
            title: "logs",
            url: `/projects/${project.id}/monitor/logs`
          }
        ]
      }
    ]
    }
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
            subItems: projectTreeItems
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

  const renderSubItems = (items: SidebarTreeItem[]) => (
    <SidebarMenuSub>
      {items.map((item) => (
        <SidebarMenuSubItem key={item.url ?? item.title}>
          {item.items && item.items.length > 0 && !item.url ? (
            <details className="group/folder">
              <summary className="list-none">
                <SidebarMenuSubButton
                  asChild
                  className="cursor-pointer select-none"
                >
                  <span>
                    <Folder
                      className="group-open/folder:hidden"
                      style={{ color: getFolderColor(item.title) }}
                    />
                    <FolderOpen
                      className="hidden group-open/folder:block"
                      style={{ color: getFolderColor(item.title) }}
                    />
                    <span className="flex-1">{item.title}</span>
                    {item.count != null && (
                      <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">{item.count}</span>
                    )}
                  </span>
                </SidebarMenuSubButton>
              </summary>
              {renderSubItems(item.items)}
            </details>
          ) : item.url ? (
            <SidebarMenuSubButton asChild>
              <a href={item.url}>
                <span>{item.title}</span>
              </a>
            </SidebarMenuSubButton>
          ) : (
            <SidebarMenuSubButton
              aria-disabled="true"
              className="cursor-default font-medium text-sidebar-foreground/75 hover:bg-transparent hover:text-sidebar-foreground/75"
            >
              <span>{item.title}</span>
            </SidebarMenuSubButton>
          )}
          {item.items && item.items.length > 0 && item.url && renderSubItems(item.items)}
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  )

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
                    {subItem.subItems && subItem.subItems.length > 0 && renderSubItems(subItem.subItems)}
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

