export const siteConfig = {
  name: "Westheimer Designs",
  description: "Premium furniture for modern living. Handcrafted quality, sustainable materials, and timeless designs for every room.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://westheimerdesigns.com",
  ogImage: "/og-image.jpg",
  links: {
    twitter: "https://twitter.com/westheimerdesigns",
    facebook: "https://facebook.com/westheimerdesigns",
    instagram: "https://instagram.com/westheimerdesigns",
    pinterest: "https://pinterest.com/westheimerdesigns",
  },
  contact: {
    email: "support@westheimerdesigns.com",
    phone: "+1 (555) 123-4567",
    address: "123 Westheimer Rd, Design District, NY 10001",
  },
  businessHours: {
    weekdays: "9:00 AM - 6:00 PM",
    saturday: "10:00 AM - 4:00 PM",
    sunday: "Closed",
  },
  priceRange: "$$",
  paymentMethods: ["Visa", "Mastercard", "American Express", "PayPal", "Apple Pay"],
  currencies: ["USD"],
  languages: ["en-US"],
};

export const defaultMetadata = {
  title: {
    default: "Westheimer Designs - Premium Furniture for Modern Living",
    template: "%s | Westheimer Designs",
  },
  description: siteConfig.description,
  keywords: [
    "furniture",
    "home decor",
    "interior design",
    "modern furniture",
    "handcrafted furniture",
    "sustainable furniture",
    "living room furniture",
    "bedroom furniture",
    "dining room furniture",
    "office furniture",
    "outdoor furniture",
  ],
  authors: [{ name: "Westheimer Designs" }],
  creator: "Westheimer Designs",
  publisher: "Westheimer Designs",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Westheimer Designs - Premium Furniture for Modern Living",
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Westheimer Designs - Premium Furniture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Westheimer Designs - Premium Furniture for Modern Living",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@westheimerdesigns",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
    yahoo: "yahoo-verification-code",
  },
};

export const categoryMetadata = {
  "living-room": {
    title: "Living Room Furniture",
    description: "Transform your living space with our premium sofas, sectionals, coffee tables, and accent chairs. Handcrafted for comfort and style.",
    keywords: ["living room furniture", "sofas", "sectionals", "coffee tables", "accent chairs", "tv stands"],
  },
  bedroom: {
    title: "Bedroom Furniture",
    description: "Create your perfect sanctuary with our collection of beds, dressers, nightstands, and wardrobes. Quality craftsmanship for restful nights.",
    keywords: ["bedroom furniture", "beds", "dressers", "nightstands", "wardrobes", "mattresses"],
  },
  "dining-room": {
    title: "Dining Room Furniture",
    description: "Gather around beautiful dining tables and chairs. From intimate breakfasts to holiday feasts, find the perfect set for your space.",
    keywords: ["dining room furniture", "dining tables", "dining chairs", "buffets", "china cabinets"],
  },
  office: {
    title: "Office Furniture",
    description: "Work in style with ergonomic desks, comfortable chairs, and smart storage solutions. Designed for productivity and comfort.",
    keywords: ["office furniture", "desks", "office chairs", "bookcases", "filing cabinets"],
  },
  outdoor: {
    title: "Outdoor Furniture",
    description: "Extend your living space outdoors with weather-resistant furniture. Perfect for patios, decks, and gardens.",
    keywords: ["outdoor furniture", "patio sets", "outdoor sofas", "dining sets", "umbrellas"],
  },
  storage: {
    title: "Storage Solutions",
    description: "Organize your home with stylish storage furniture. Bookshelves, cabinets, and modular systems for every room.",
    keywords: ["storage furniture", "bookshelves", "cabinets", "shelving units", "organizers"],
  },
  lighting: {
    title: "Lighting",
    description: "Illuminate your space with our curated collection of floor lamps, table lamps, pendants, and chandeliers.",
    keywords: ["lighting", "floor lamps", "table lamps", "pendants", "chandeliers", "wall sconces"],
  },
  decor: {
    title: "Home Decor",
    description: "Add the finishing touches with our selection of rugs, mirrors, wall art, and decorative accessories.",
    keywords: ["home decor", "rugs", "mirrors", "wall art", "vases", "decorative accessories"],
  },
};