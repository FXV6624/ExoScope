import {
  ChevronRight,
  Database,
  LayoutDashboard,
  LogIn,
  Telescope,
} from "lucide-react"
import { useState } from "react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { NavGroup } from "./NavGroup"
import { NavItem } from "./NavItem"
import { User } from "./User"

export function AppSidebar() {
  const { user: currentUser, logout } = useAuth()
  const [adminOpen, setAdminOpen] = useState(true)

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="gap-0">
        <NavItem icon={LayoutDashboard} title="Dashboard" path="/" exact />
        <NavItem icon={Telescope} title="Exoplanets" path="/exoplanets" />

        {currentUser && (
          <NavGroup
            icon={Database}
            title="Admin"
            open={adminOpen}
            onToggle={() => setAdminOpen((o) => !o)}
            chevron={ChevronRight}
            items={[
              { title: "Control", path: "/admin/etl" },
              { title: "Users", path: "/admin/users" },
            ]}
          />
        )}
      </SidebarContent>

      <SidebarFooter>
        {!currentUser && (
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sign In" onClick={logout}>
              <LogIn className="size-4 text-muted-foreground" />
              <span>Sign In</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
