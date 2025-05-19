import React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/universal/logo";
import { ArrowUpRight, Instagram } from "lucide-react";

interface LinkItem {
  href: string;
  label: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
  icon?: React.ComponentType<any> | React.ReactNode;
}

interface LinkGroup {
  label: string;
  items: LinkItem[];
}

const LinkGroups: LinkGroup[] = [
  {
    label: "Navegación",
    items: [
      // {
      //   href: "/product",
      //   label: "Producto",
      // },
      {
        href: "/login",
        label: "Inicia sesión",
      },
      {
        href: "/register",
        label: "Crea tu mesa de regalos",
      },
    ],
  },
  // {
  //   label: "Documentación",
  //   items: [
  //     {
  //       href: "/docs/getting-started",
  //       label: "Primeros pasos",
  //     },
  //     {
  //       href: "/docs/products",
  //       label: "Productos",
  //     },
  //     {
  //       href: "/docs/orders",
  //       label: "Órdenes",
  //     },
  //     {
  //       href: "/docs/users",
  //       label: "Usuarios",
  //     },
  //   ],
  // },
  {
    label: "Ayuda",
    items: [
      {
        href: "https://wa.me/+528712698803",
        label: "Whatsapp",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      {
        href: "mailto:soporte@knoott.com",
        label: "Correo electrónico",
      },
    ],
  },
  {
    label: "Legal",
    items: [
      {
        href: "/terms-and-conditions",
        label: "Términos y condiciones",
      },
      {
        href: "/privacy-policy",
        label: "Avsio de privacidad",
      },
      // {
      //   href: "/politica-de-envíos",
      //   label: "Política de envíos",
      // },
      // {
      //   href: "/politica-de-devoluciones",
      //   label: "Política de devoluciones",
      // }
    ],
  },
  {
    label: "Social",
    items: [
      {
        href: "https://www.instagram.com/knoott.partners",
        label: "Instagram",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      {
        href: "https://www.tiktok.com/@knoottmx",
        label: "Tiktok",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    ],
  },
];

export const FooterWebsite = () => {
  return (
    <footer className="w-full bg-foreground px-3 md:px-7 lg:px-14 xl:px-36 2xl:px-56 py-14 lg:py-20">
      <div className="flex flex-col gap-y-7 xl:gap-y-10 w-full">
        <span className="w-full h-fit items-start lg:items-center justify-between flex flex-col lg:flex-row gap-5 gap-y-7 mb-10">
          <Link href="/" className="w-fit" aria-label="Home">
            <Logo className="h-10 w-auto" variant="white" />
          </Link>
        </span>
        <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-7">
          {LinkGroups.map((group, index) => (
            <ul
              key={index}
              className="flex flex-col list-none"
              aria-label={group.label}
            >
              <li className="text-background text-base font-medium mb-3">
                {group.label}
              </li>
              {group.items.map((item, itemIndex) => (
                <li key={itemIndex} className="mb-1">
                  <Link
                    href={item.href}
                    className="text-white/50 text-sm hover:text-background transition-colors flex items-center justify-start gap-x-1.5 w-fit"
                    target={item.target}
                    rel={item.rel}
                  >
                    {item.label}
                    {item.icon &&
                      (typeof item.icon === "function"
                        ? React.createElement(
                            item.icon as React.ComponentType<any>,
                            { className: "size-3.5" }
                          )
                        : item.icon)}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </nav>
        <Separator className="bg-muted-foreground/20" />
        <div className="w-full items-center justify-start lg:justify-center flex gap-x-2">
          <p className="text-white/50 text-sm">
            Powered by{" "}
            <Link
              href={"https://intelloai.com"}
              target="_blank"
              className="hover:text-white"
            >
              Intello AI{" "}
            </Link>
            | &copy; {new Date().getFullYear()} Knoott | Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterWebsite;
