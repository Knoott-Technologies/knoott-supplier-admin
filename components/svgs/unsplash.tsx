import { SVGProps } from "react";

export const Unsplash = (props: SVGProps<SVGSVGElement>) => (
  <svg className="size-4" {...props} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"
      className="fill-foreground"
      fill-rule="nonzero"
    />
  </svg>
);