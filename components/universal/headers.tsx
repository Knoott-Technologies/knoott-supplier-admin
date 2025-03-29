"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { libre } from "../fonts/font-def";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  children?: React.ReactNode;
  id?: string;
  className?: string;
  back?: boolean;
  logo?: string;
  href?: string;
}

export const PageHeader = ({
  title,
  description,
  children,
  id,
}: PageHeaderProps) => {
  return (
    <section
      id={id}
      className="w-full h-fit items-start justify-between flex mb-5 lg:mb-7 gap-5 shrink-0"
    >
      <div className="flex flex-col gap-y-1 items-start justify-start max-w-3xl">
        <h1
          className={cn(
            "text-2xl xl:text-3xl tracking-tight font-semibold",
            libre.className
          )}
        >
          {title}
        </h1>
        <p className="text-muted-foreground text-sm lg:text-base">
          {description}
        </p>
      </div>
      <div className="flex gap-x-1 items-center justify-end">{children}</div>
    </section>
  );
};

export const PageHeaderLoading = ({
  title,
  description,
  children,
  id,
}: PageHeaderProps) => {
  return (
    <section
      id={id}
      className="w-full h-fit items-start justify-between flex mb-5 lg:mb-7 gap-5 shrink-0"
    >
      <div className="flex flex-col gap-y-1 items-start justify-start max-w-3xl">
        <h1
          className={cn(
            "text-2xl xl:text-3xl tracking-tight font-semibold animate-pulse",
            libre.className
          )}
        >
          {title}
        </h1>
        <p className="text-muted-foreground text-sm lg:text-base animate-pulse">
          {description}
        </p>
      </div>
      <div className="flex gap-x-1 items-center justify-end">{children}</div>
    </section>
  );
};

export const PageHeaderBackButton = ({
  title,
  description,
  children,
  id,
  back = true,
  className,
}: PageHeaderProps) => {
  const router = useRouter();

  return (
    <section
      id={id}
      className={cn(
        "w-full h-fit items-start justify-between flex mb-5 lg:mb-7 gap-5 shrink-0",
        className
      )}
    >
      <div className="flex flex-col gap-y-1 items-start justify-start max-w-3xl">
        <div
          className="flex gap-x-2 items-center cursor-pointer"
          onClick={() => back && router.back()}
        >
          <ArrowLeft className="size-4 xl:size-6" />
          <h1
            className={cn(
              "text-2xl xl:text-3xl tracking-tight font-semibold",
              libre.className
            )}
          >
            {title}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm lg:text-base">
          {description}
        </p>
      </div>
      <div className="flex gap-x-1 items-center justify-end">{children}</div>
    </section>
  );
};

export const PageHeaderLinkButton = ({
  title,
  description,
  children,
  id,
  className,
  href = "#",
}: PageHeaderProps) => {
  return (
    <section
      id={id}
      className={cn(
        "w-full h-fit items-start justify-between flex mb-5 lg:mb-7 gap-5 shrink-0",
        className
      )}
    >
      <div className="flex flex-col gap-y-1 items-start justify-start max-w-3xl">
        <Link href={href} className="flex gap-x-2 items-center cursor-pointer">
          <ArrowLeft className="size-4 xl:size-6" />
          <h1
            className={cn(
              "text-2xl xl:text-3xl tracking-tight font-semibold",
              libre.className
            )}
          >
            {title}
          </h1>
        </Link>
        <p className="text-muted-foreground text-sm lg:text-base">
          {description}
        </p>
      </div>
      <div className="flex gap-x-1 items-center justify-end">{children}</div>
    </section>
  );
};

export const PageSubHeader = ({
  title,
  description,
  children,
  id,
  className,
}: PageHeaderProps) => {
  return (
    <div
      id={id}
      className={cn(
        "w-full h-fit items-start justify-between flex mb-5 lg:mb-7 gap-5",
        className
      )}
    >
      <div className="flex flex-col items-start justify-start">
        <h2
          className={cn(
            "text-xl xl:text-2xl tracking-tight font-semibold",
            libre.className
          )}
        >
          {title}
        </h2>
        <p className="text-muted-foreground text-sm lg:text-base">
          {description}
        </p>
      </div>
      <div className="flex gap-x-1 items-center justify-end">{children}</div>
    </div>
  );
};

export const PageSubHeaderBackButton = ({
  title,
  description,
  children,
  id,
  back = true,
  className,
}: PageHeaderProps) => {
  const router = useRouter();

  return (
    <section
      id={id}
      className={cn(
        "w-full h-fit items-start justify-between flex mb-5 lg:mb-7 gap-5 shrink-0",
        className
      )}
    >
      <div className="flex flex-col gap-y-1 items-start justify-start">
        <div
          className="flex gap-x-2 items-baseline cursor-pointer"
          onClick={() => back && router.back()}
        >
          <ArrowLeft className="size-4" />
          <h2
            className={cn(
              "text-xl xl:text-2xl tracking-tight font-semibold",
              libre.className
            )}
          >
            {title}
          </h2>
        </div>
        <p className="text-muted-foreground text-sm lg:text-base">
          {description}
        </p>
      </div>
      <div className="flex gap-x-1 items-center justify-end">{children}</div>
    </section>
  );
};

export const PageMiniHeader = ({
  title,
  description,
  children,
  id,
  className,
}: PageHeaderProps) => {
  return (
    <div
      id={id}
      className={cn(
        "w-full h-fit items-start justify-between flex mb-5 lg:mb-7 gap-5",
        className
      )}
    >
      <div className="flex flex-col gap-y-1 items-start justify-start">
        <h1
          className={cn(
            "text-lg xl:text-xl tracking-tight font-semibold",
            libre.className
          )}
        >
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <div className="flex gap-x-1 items-center justify-end">{children}</div>
    </div>
  );
};

export const PageHeaderWithLogo = ({
  title,
  description,
  children,
  id,
  logo,
}: PageHeaderProps) => {
  return (
    <section
      id={id}
      className="w-full h-fit items-start justify-between flex mb-5 lg:mb-7 gap-5 shrink-0"
    >
      <div className="flex flex-col gap-y-1 items-start justify-start max-w-3xl">
        {(logo && (
          <span className="flex gap-x-2 items-center">
            <Avatar className="size-6 xl:size-[30px] rounded-none">
              <AvatarImage src={logo} alt={"imagen logo"} />
            </Avatar>
            <h1
              className={cn(
                "text-2xl xl:text-3xl tracking-tight font-semibold",
                libre.className
              )}
            >
              {title}
            </h1>
          </span>
        )) || (
          <h1
            className={cn(
              "text-2xl xl:text-3xl tracking-tight font-semibold",
              libre.className
            )}
          >
            {title}
          </h1>
        )}
        <p className="text-muted-foreground text-sm lg:text-base">
          {description}
        </p>
      </div>
      <div className="flex gap-x-1 items-center justify-end">{children}</div>
    </section>
  );
};
