"use client";

import { Script } from "next/script";

interface JsonLdProps {
  data: object;
  id?: string;
}

export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
      strategy="lazyOnload"
    />
  );
}

export function OrganizationJsonLd() {
  return null; // Will be rendered server-side
}

export function ProductJsonLd() {
  return null; // Will be rendered server-side
}

export function BreadcrumbJsonLd() {
  return null; // Will be rendered server-side
}

export function FAQJsonLd() {
  return null; // Will be rendered server-side
}