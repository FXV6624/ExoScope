import {
  ChevronRight,
  Database,
  LayoutDashboard,
  Telescope,
} from "lucide-react"
import { useState } from "react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { NavGroup } from "./NavGroup"
import { NavItem } from "./NavItem"
import { User } from "./User"

export function AppSidebar() {
  const { user: currentUser } = useAuth()
  const [adminOpen, setAdminOpen] = useState(true)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <Logo variant="responsive" />
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <NavItem icon={LayoutDashboard} title="Dashboard" path="/" exact />
        <NavItem icon={Telescope} title="Exoplanets" path="/exoplanets" />

        {currentUser?.is_superuser && (
          <NavGroup
            icon={Database}
            title="Admin"
            open={adminOpen}
            onToggle={() => setAdminOpen((o) => !o)}
            chevron={ChevronRight}
            items={[
              { title: "ETL", path: "/admin/etl" },
              { title: "Users", path: "/admin/users" },
            ]}
          />
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
