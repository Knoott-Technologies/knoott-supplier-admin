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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import type { Database } from "@/database.types";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ChevronDown,
  type LucideIcon,
  Plus,
  Tag,
  ArrowLeftRight,
  LayoutDashboard,
  Package,
  FileLineChartIcon as FileChartLine,
  RectangleHorizontalIcon,
  ChevronsUp,
  Barcode,
  ChartPie,
  ChartNoAxesCombined,
  Users2,
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
  badge?: number;
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
  visibleTo: Database["public"]["Enums"]["provider_businees_user_roles"][];
}

export const SidebarContentProvider = ({
  businessId,
  logoUrl,
  role = "admin",
  ordersCount,
}: {
  businessId: string;
  logoUrl?: string;
  role: Database["public"]["Enums"]["provider_businees_user_roles"];
  ordersCount: number;
}) => {
  const pathname = usePathname();
  const startUrl = `/dashboard/${businessId}`;
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
      label: "Tienda",
      visibleTo: ["admin", "supervisor"],
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
          badge: ordersCount,
        },
      ],
    },
    {
      label: "Tienda",
      visibleTo: ["staff"],
      items: [
        {
          title: "Órdenes",
          icon: Package,
          href: `${startUrl}/orders`,
          badge: ordersCount,
        },
      ],
    },
    {
      label: "Finanzas",
      visibleTo: ["admin"],
      items: [
        {
          title: "Transacciones",
          icon: ArrowLeftRight,
          href: `${startUrl}/transactions`,
        },
        {
          title: "Reportes",
          icon: FileChartLine,
          href: `${startUrl}/reports`,
        },
      ],
    },
    {
      label: "Mercadotecnia",
      visibleTo: ["admin", "supervisor", "staff"],
      items: [
        {
          title: "Banners",
          icon: RectangleHorizontalIcon,
          href: `${startUrl}/banners`,
        },
        {
          title: "Potenciadores",
          icon: ChevronsUp,
          href: `${startUrl}/reports`,
        },
      ],
    },
    {
      label: "Analítica",
      visibleTo: ["admin", "supervisor"],
      items: [
        {
          title: "Productos",
          icon: ChartPie,
          href: `${startUrl}/product-analitics`,
        },
        {
          title: "Ventas",
          icon: ChartNoAxesCombined,
          href: `${startUrl}/sales-analitics`,
        },
      ],
    },
    {
      label: "Gestión",
      visibleTo: ["admin"],
      items: [
        {
          title: "Usuarios",
          icon: Users2,
          href: `${startUrl}/users`,
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
      {menuItems
        .filter((group) => group.visibleTo.includes(role))
        .map((group, index, filteredGroups) => {
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
                                {item.badge !== undefined && item.badge > 0 && (
                                  <SidebarMenuBadge className="border bg-background">
                                    {item.badge}
                                  </SidebarMenuBadge>
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
                              {item.badge !== undefined && item.badge > 0 && (
                                <SidebarMenuBadge className="border bg-background">
                                  {item.badge}
                                </SidebarMenuBadge>
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
              {index < filteredGroups.length - 1 && <SidebarSeparator />}
            </React.Fragment>
          );
        })}
    </>
  );
};
