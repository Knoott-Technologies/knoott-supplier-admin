"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubAction,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { User } from "@supabase/supabase-js";
import { ChevronDown, FileText, Home } from "lucide-react";
import { SidebarDocsHeader } from "./docs-header";
import Link from "next/link";
import type { DocNavItem } from "../_lib/docs-service";
import { useRef } from "react";

// Necesitamos convertir el componente a cliente para usar useRef
export default function DocsSidebar({
  user,
  docs,
}: {
  user: User | null;
  docs: DocNavItem[];
}) {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarDocsHeader />
      <SidebarContent>
        {/* Elemento de inicio */}
        <SidebarGroup className="pb-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={"Inicio"} asChild>
                  <Link href={"/"}>
                    <Home />
                    <span>Inicio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Documentación principal */}
        <SidebarGroup className="first:pt-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {docs.map((item) => (
                <RenderNavItem
                  key={item.slug.join("/") || "index"}
                  item={item}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

// Componente para renderizar un elemento de navegación
function RenderNavItem({ item }: { item: DocNavItem }) {
  // Generar la URL correcta
  const href =
    item.slug.length === 0 ? "/docs" : `/docs/${item.slug.join("/")}`;
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Si tiene hijos, renderizar como collapsible
  if (item.children && item.children.length > 0) {
    return (
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarMenuItem>
          {/* Botón principal para navegar */}
          <SidebarMenuButton asChild>
            <Link href={href}>
              <FileText className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>

          {/* Acción para colapsar/expandir */}
          <CollapsibleTrigger asChild>
            <SidebarMenuAction ref={triggerRef}>
              <ChevronDown className="transition-transform group-data-[state=open]/collapsible:rotate-180" />
              <span className="sr-only">Toggle {item.title}</span>
            </SidebarMenuAction>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => (
                <RenderSubItem key={child.slug.join("/")} item={child} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  // Si no tiene hijos, renderizar como elemento de menú simple
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link href={href}>
          <FileText className="mr-2 h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// Componente para renderizar un elemento de submenú
function RenderSubItem({ item }: { item: DocNavItem }) {
  const href = `/docs/${item.slug.join("/")}`;
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Si tiene hijos (tercer nivel), renderizar como otro collapsible
  if (item.children && item.children.length > 0) {
    return (
      <Collapsible defaultOpen className="group/subcollapsible">
        <SidebarMenuSubItem>
          {/* Botón principal para navegar */}
          <SidebarMenuSubButton asChild>
            <Link href={href}>{item.title}</Link>
          </SidebarMenuSubButton>

          {/* Acción para colapsar/expandir */}
          <CollapsibleTrigger asChild>
            <SidebarMenuSubAction ref={triggerRef}>
              <ChevronDown className="transition-transform group-data-[state=open]/subcollapsible:rotate-180" />
              <span className="sr-only">Toggle {item.title}</span>
            </SidebarMenuSubAction>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child) => (
                <SidebarMenuSubItem key={child.slug.join("/")}>
                  <SidebarMenuSubButton asChild>
                    <Link href={`/docs/${child.slug.join("/")}`}>
                      {child.title}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuSubItem>
      </Collapsible>
    );
  }

  // Si no tiene hijos, renderizar como elemento de submenú simple
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild>
        <Link href={href}>{item.title}</Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
