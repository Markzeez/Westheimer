import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/products/",
          "/about",
          "/contact",
          "/cart",
          "/checkout",
          "/wishlist",
          "/account",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/_next/",
          "/static/",
          "/*.json$",
          "/checkout/*",
          "/cart",
          "/wishlist",
          "/account",
          "/login",
          "/register",
          "/orders/",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        disallow: "/",
      },
      {
        userAgent: "ClaudeBot",
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}