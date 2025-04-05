"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SheetClose } from "@/components/ui/sheet";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ChevronDown,
  LucideIcon,
  PencilRuler,
  Plus,
  Users,
  Tag,
  ArrowLeftRight,
  LayoutDashboard,
  Package,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
  action?: ActionProps;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
}

interface ActionProps {
  href: string;
  icon?: LucideIcon;
  title?: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export const SidebarContentProvider = ({
  branchId,
  logoUrl,
}: {
  branchId: string;
  logoUrl?: string;
}) => {
  const pathname = usePathname();
  const startUrl = `/dashboard/${branchId}`;
  const isMobile = useIsMobile();

  const checkActive = React.useCallback(
    (href: string) => {
      return pathname.startsWith(href);
    },
    [pathname]
  );

  // Helper function to conditionally wrap with SheetClose
  const wrapIfMobile = (element: React.ReactNode) => {
    if (isMobile) {
      return <SheetClose asChild>{element}</SheetClose>;
    }
    return element;
  };

  const menuItems: MenuGroup[] = [
    {
      label: "Mi tienda",
      items: [
        {
          title: "Productos",
          icon: Tag,
          href: `${startUrl}/products`,
        },
        {
          title: "Órdenes",
          icon: Package,
          href: `${startUrl}/orders`,
        },
        {
          title: "Transacciones",
          icon: ArrowLeftRight,
          href: `${startUrl}/transactions`,
        },
      ],
    },
  ];

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              {wrapIfMobile(
                <SidebarMenuButton
                  isActive={pathname === `${startUrl}`}
                  tooltip={"Vista General"}
                  asChild
                >
                  <Link href={`${startUrl}`}>
                    <LayoutDashboard />
                    <span>Vista General</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarSeparator />
      {menuItems.map((group, index) => {
        return (
          <React.Fragment key={index}>
            <Collapsible
              defaultOpen
              className="group/collapsible ease-in-out duration-200 transition-all"
            >
              <SidebarGroup className="group-data-[state=open]/collapsible:py-2">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="hover:text-foreground">
                    {group.label}
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent className="transition-all duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item, index) => {
                        return item.subItems ? (
                          <Collapsible
                            key={index}
                            defaultOpen
                            className="group/subcollapsible"
                          >
                            <SidebarMenuItem>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton
                                  tooltip={item.title}
                                  isActive={checkActive(item.href)}
                                >
                                  <item.icon />
                                  <span>{item.title}</span>
                                  <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/subcollapsible:rotate-180" />
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                              {item.action &&
                                wrapIfMobile(
                                  <SidebarMenuAction
                                    className="hover:bg-foreground hover:text-background ease-in-out transition-colors duration-200"
                                    asChild
                                  >
                                    <Link href={item.action.href}>
                                      {(item.action.icon && (
                                        <item.action.icon />
                                      )) || <Plus />}
                                      <span className="sr-only">
                                        {item.action.title}
                                      </span>
                                    </Link>
                                  </SidebarMenuAction>
                                )}
                              <CollapsibleContent className="transition-all duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                                <SidebarMenuSub>
                                  {item.subItems.map((subItem, subIndex) => (
                                    <SidebarMenuSubItem key={subIndex}>
                                      {wrapIfMobile(
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={checkActive(subItem.href)}
                                        >
                                          <Link href={subItem.href}>
                                            <subItem.icon />
                                            <span>{subItem.title}</span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      )}
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </SidebarMenuItem>
                          </Collapsible>
                        ) : (
                          <SidebarMenuItem key={index}>
                            {wrapIfMobile(
                              <SidebarMenuButton
                                tooltip={item.title}
                                asChild
                                isActive={checkActive(item.href)}
                              >
                                <Link href={item.href}>
                                  <item.icon />
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            )}
                            {item.action &&
                              wrapIfMobile(
                                <SidebarMenuAction
                                  className="hover:bg-foreground hover:text-background ease-in-out transition-colors duration-200"
                                  asChild
                                >
                                  <Link href={item.action.href}>
                                    {(item.action.icon && (
                                      <item.action.icon />
                                    )) || <Plus />}
                                    <span className="sr-only">
                                      {item.action.title}
                                    </span>
                                  </Link>
                                </SidebarMenuAction>
                              )}
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
            {index < menuItems.length - 1 && <SidebarSeparator />}
          </React.Fragment>
        );
      })}
    </>
  );
};
