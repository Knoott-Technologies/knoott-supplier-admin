"use client";

import {
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Icon } from "@/components/universal/logo";
import Link from "next/link";

export const SidebarDocsHeader = () => {
  const { state } = useSidebar();
  return (
    <SidebarHeader className="h-12 flex flex-row items-center justify-between">
      <Link className="size-fit" href="/">
        <Icon className="size-8" />
      </Link>
      <SidebarTrigger
        variant={"ghost"}
        className={state === "collapsed" ? "hidden" : ""}
      />
    </SidebarHeader>
  );
};
