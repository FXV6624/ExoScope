import { Link as RouterLink, useRouterState } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface NavItemProps {
  icon: LucideIcon
  title: string
  path: string
  /** If true, only match exactly this path (not prefix) */
  exact?: boolean
}

export function NavItem({ icon: Icon, title, path, exact }: NavItemProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const router = useRouterState()
  const currentPath = router.location.pathname

  const isActive = exact
    ? currentPath === path
    : currentPath === path ||
      currentPath.startsWith(`${path}/`) ||
      currentPath.startsWith(path)

  const handleClick = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <div className="px-2 py-0.5">
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={title} isActive={isActive} asChild>
          <RouterLink to={path} onClick={handleClick}>
            <Icon />
            <span>{title}</span>
          </RouterLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </div>
  )
}
