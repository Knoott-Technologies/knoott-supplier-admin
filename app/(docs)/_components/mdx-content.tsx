"use client";

import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote";
import { useMDXComponents } from "./mdx-components";

interface MDXContentProps {
  source: MDXRemoteProps;
}

export function MDXContent({ source }: MDXContentProps) {
  const components = useMDXComponents();

  return <MDXRemote {...source} components={components} />;
}
