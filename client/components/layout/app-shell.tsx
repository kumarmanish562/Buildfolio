"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";

import { BuildfolioIcon } from "@/components/icons/buildfolio-logo";

import { ModeToggle } from "@/components/ui/mode-toggle";

import { useCurrentUser, useLogout } from "@/hooks/use-auth";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Separator } from "@/components/ui/separator";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  dashboardNavGroups,
  isDashboardNavActive,
} from "@/lib/dashboard-nav";

import { cn } from "@/lib/utils";

/* =========================================================
   APP SHELL
   ========================================================= */

export function AppShell({
  children,
  title,
  description,
  actions,
  hideHeader = false,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  hideHeader?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <SidebarProvider>
      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <Sidebar
        variant="inset"
        collapsible="icon"
      >
        {/* ===================================================
            SIDEBAR HEADER
            =================================================== */}

        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                render={
                  <Link href="/dashboard" />
                }
                tooltip="BuildFolio"
              >
                {/* -------------------------------------------------
                    EXPANDED SIDEBAR LOGO

                    Use BuildfolioIcon instead of BuildfolioLogo
                    because BuildfolioLogo already contains the
                    complete text wordmark.
                   ------------------------------------------------- */}

                <BuildfolioIcon
                  className="
                    size-8
                    rounded-[10px]
                    shrink-0
                  "
                />

                {/* -------------------------------------------------
                    BRAND TEXT

                    Hidden automatically when sidebar collapses.
                   ------------------------------------------------- */}

                <div
                  className="
                    grid
                    flex-1
                    text-left
                    text-sm
                    leading-tight
                    group-data-[collapsible=icon]:hidden
                  "
                >
                  <span className="truncate font-semibold">
                    BuildFolio
                  </span>

                  <span className="truncate text-xs text-muted-foreground">
                    Chat with your code
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ===================================================
            SIDEBAR NAVIGATION
            =================================================== */}

        <SidebarContent>
          {dashboardNavGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>
                {group.label}
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isDashboardNavActive(
                          pathname,
                          item.href,
                          item.exact
                        )}
                        tooltip={item.title}
                        render={
                          <Link href={item.href} />
                        }
                      >
                        <item.icon />

                        <span>
                          {item.title}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {/* ===================================================
            SIDEBAR FOOTER / USER MENU
            =================================================== */}

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                {/* -------------------------------------------------
                    IMPORTANT:

                    DropdownMenuTrigger must contain ONE valid
                    SidebarMenuButton element.

                    The previous JSX had an incorrectly nested
                    closing tag which caused:

                    "Expected corresponding JSX closing tag"
                   ------------------------------------------------- */}

                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      size="lg"
                      className="data-popup-open:bg-sidebar-accent"
                    />
                  }
                >
                  {/* -------------------------------------------------
                      USER AVATAR
                     ------------------------------------------------- */}

                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage
                      src={
                        user?.avatarUrl ??
                        undefined
                      }
                      alt={
                        user?.displayName ??
                        "User"
                      }
                    />

                    <AvatarFallback className="rounded-lg">
                      {(
                        user?.displayName ??
                        "U"
                      )
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* -------------------------------------------------
                      USER INFORMATION
                     ------------------------------------------------- */}

                  <div
                    className="
                      grid
                      flex-1
                      text-left
                      text-sm
                      leading-tight
                      group-data-[collapsible=icon]:hidden
                    "
                  >
                    <span className="truncate font-medium">
                      {user?.displayName ??
                        "Developer"}
                    </span>

                    <span className="truncate text-xs text-muted-foreground">
                      @
                      {user?.githubUsername ??
                        "github"}
                    </span>
                  </div>
                </DropdownMenuTrigger>

                {/* =================================================
                    DROPDOWN CONTENT
                    ================================================= */}

                <DropdownMenuContent
                  className="min-w-56 rounded-xl"
                  side="top"
                  align="start"
                  sideOffset={8}
                >
                  {/* -------------------------------------------------
                      ACCOUNT INFORMATION
                     ------------------------------------------------- */}

                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                          {user?.displayName ??
                            "Developer"}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          Connected via GitHub
                        </span>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  {/* -------------------------------------------------
                      SETTINGS
                     ------------------------------------------------- */}

                  <DropdownMenuItem
                    onClick={() =>
                      router.push(
                        "/dashboard/settings"
                      )
                    }
                  >
                    <Settings />

                    <span>
                      Settings
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* -------------------------------------------------
                      LOGOUT
                     ------------------------------------------------- */}

                  <DropdownMenuItem
                    onClick={() =>
                      logout.mutate()
                    }
                    disabled={logout.isPending}
                  >
                    <LogOut />

                    <span>
                      {logout.isPending
                        ? "Logging out..."
                        : "Log out"}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* =========================================================
          MAIN APPLICATION AREA
          ========================================================= */}

      <SidebarInset>
        {/* =======================================================
            TOP HEADER
            ======================================================= */}

        {!hideHeader && (
          <header
            className="
              sticky
              top-0
              z-30
              flex
              h-14
              shrink-0
              items-center
              gap-2
              border-b
              bg-background/80
              px-4
              backdrop-blur-xl
            "
          >
            {/* -------------------------------------------------
                SIDEBAR TOGGLE
               ------------------------------------------------- */}

            <SidebarTrigger className="-ml-1" />

            {/* -------------------------------------------------
                VERTICAL SEPARATOR
               ------------------------------------------------- */}

            <Separator
              orientation="vertical"
              className="mr-2 h-4"
            />

            {/* -------------------------------------------------
                HEADER CONTENT
               ------------------------------------------------- */}

            <div
              className="
                flex
                min-w-0
                flex-1
                items-center
                justify-between
                gap-3
              "
            >
              {/* =================================================
                  PAGE TITLE
                  ================================================= */}

              <div className="min-w-0">
                {title && (
                  <h1
                    className="
                      truncate
                      font-heading
                      text-sm
                      font-semibold
                    "
                  >
                    {title}
                  </h1>
                )}

                {description && (
                  <p
                    className="
                      truncate
                      text-xs
                      text-muted-foreground
                    "
                  >
                    {description}
                  </p>
                )}
              </div>

              {/* =================================================
                  HEADER ACTIONS
                  ================================================= */}

              <div className="flex items-center gap-2">
                {actions}

                <ModeToggle />
              </div>
            </div>
          </header>
        )}

        {/* =======================================================
            PAGE CONTENT

            min-h-0 is important for chat pages and scrollable
            layouts so the content does not overflow the viewport.
            ======================================================= */}

        <div
          className="
            flex
            min-h-0
            flex-1
            flex-col
          "
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/* =============================================================
   BRAND MARK

   Used when you need the compact BuildFolio branding outside
   the sidebar.
   ============================================================= */

export function BrandMark({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        `
        flex
        items-center
        gap-2.5
        font-semibold
        tracking-tight
        `,
        className
      )}
    >
      {/* -------------------------------------------------------
          Compact icon

          BuildfolioIcon is intentionally used here instead
          of BuildfolioLogo so we don't duplicate the wordmark.
         ------------------------------------------------------- */}

      <BuildfolioIcon
        className="
          size-8
          rounded-[10px]
          shrink-0
        "
      />

      {/* -------------------------------------------------------
          Brand name
         ------------------------------------------------------- */}

      <span
        className="
          font-heading
          text-[1.05rem]
          leading-none
        "
      >
        BuildFolio
      </span>
    </div>
  );
}

/* =============================================================
   GHOST BUTTON LINK

   Reusable small navigation button.
   ============================================================= */

export function GhostButtonLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      render={
        <Link href={href} />
      }
    >
      {children}
    </Button>
  );
}