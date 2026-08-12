"use client";

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
} from "@/components/animate-ui/components/radix/sidebar";
import { Button } from "@/components/ui/button";
import { Portfolio } from "@/db/schema";
import { HelpCircle, Loader2, Mail, Plus, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import CreatePortfolioDialog from "../CreatePortfolioDialog";
import DesktopPortfolioSidebar from "./components/DesktopPortfolioSidebar";
import SidebarInstallButton from "./components/SidebarInstallButton";
import SidebarUserSection from "./components/SidebarUserSection";

interface PortfoliosSidebarProps {
  portfolioList: Portfolio[];
  children?: React.ReactNode;
}

export const PortfoliosSidebar = ({ portfolioList, children }: PortfoliosSidebarProps) => {
  const pathname = usePathname();

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <Sidebar
        variant="sidebar"
        collapsible="offcanvas"
        className="h-svh max-h-svh overflow-x-hidden overflow-y-hidden border-r border-sidebar-border/70"
      >
        {/* Logo Header */}
        <SidebarHeader className="shrink-0 border-b border-sidebar-border/70 px-3 py-3">
          <Link href="/home" className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image src="/icon.png" alt="Logo" fill sizes="32px" priority />
            </div>
            <h1 className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
              PsxWorth
              <span className="text-xs bg-inherit bg-clip-text text-transparent">.com</span>
            </h1>
          </Link>
        </SidebarHeader>

        <SidebarContent className="no-scrollbar min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto overscroll-contain px-2 py-3">
          {/* My Portfolios Section */}
          <SidebarGroup className="p-1">
            <div className="mb-2 flex items-center justify-between">
              <SidebarGroupLabel className="px-0 text-[11px] tracking-wide uppercase text-sidebar-foreground/70">
                My Portfolios
              </SidebarGroupLabel>
              <CreatePortfolioDialog
                navigateOnSuccess={!pathname.includes("portfolio")}
                trigger={
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-sidebar-accent">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                }
              />
            </div>
            <SidebarGroupContent>
              <Suspense
                fallback={
                  <div className="flex h-24 items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Loading...</span>
                    </div>
                  </div>
                }
              >
                {portfolioList.length > 0 ? (
                  <DesktopPortfolioSidebar portfolioList={portfolioList} />
                ) : (
                  <CreatePortfolioDialog
                    navigateOnSuccess
                    trigger={
                      <Button variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Portfolio
                      </Button>
                    }
                  />
                )}
              </Suspense>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Useful Links Section */}
          <SidebarGroup className="p-1">
            <SidebarGroupLabel className="mb-2 px-0 text-[11px] tracking-wide uppercase text-sidebar-foreground/70">
              Useful Links
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/faqs"}
                    className="rounded-md border border-transparent data-[active=true]:border-primary/60 data-[active=true]:bg-sidebar-accent/80"
                  >
                    <Link href="/faqs">
                      <HelpCircle className="h-4 w-4" />
                      <span>FAQs</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/contact"}
                    className="rounded-md border border-transparent data-[active=true]:border-primary/60 data-[active=true]:bg-sidebar-accent/80"
                  >
                    <Link href="/contact">
                      <Mail className="h-4 w-4" />
                      <span>Contact</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer with Install Button, Settings and User Account */}
        <SidebarFooter className="shrink-0 border-t border-sidebar-border/70 bg-sidebar-accent/10 px-3 py-4 gap-2">
          <SidebarInstallButton />
          
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/settings"}
                className="rounded-md border border-transparent hover:bg-sidebar-accent data-[active=true]:border-primary/60 data-[active=true]:bg-sidebar-accent/80"
              >
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarUserSection />
        </SidebarFooter>
      </Sidebar>

      {/* Main Content Area */}
      <SidebarInset className="h-svh min-h-0 overflow-x-hidden overflow-y-hidden">
        <div className="min-h-0 flex-1 p-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PortfoliosSidebar;
