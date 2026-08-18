import { siteConfig } from "./config";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  images: Array<{ url: string; alt: string; isPrimary?: boolean }>;
  inventory: number;
  ratings: number;
  reviewCount: number;
  features: string[];
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  material?: string;
  color?: string;
  sku?: string;
  brand?: string;
}

interface Organization {
  name: string;
  url: string;
  logo: string;
  sameAs: string[];
  contactPoint: {
    telephone: string;
    contactType: string;
    availableLanguage: string;
    hoursAvailable: string;
  };
}

export function generateOrganizationSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: Object.values(siteConfig.links).filter(Boolean),
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.address.split(",")[0],
      addressLocality: "New York",
      addressRegion: "NY",
      postalCode: "10001",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.contact.phone,
      contactType: "customer service",
      availableLanguage: "English",
      hoursAvailable: "Mo-Fr 09:00-18:00",
    },
    priceRange: siteConfig.priceRange,
    paymentAccepted: siteConfig.paymentMethods.join(", "),
    currenciesAccepted: siteConfig.currencies.join(", "),
    knowsAbout: [
      "Furniture",
      "Home Decor",
      "Interior Design",
      "Sustainable Furniture",
      "Handcrafted Furniture",
    ],
  };
}

export function generateWebsiteSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };
}

export function generateProductSchema(product: Product): object {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const offers = {
    "@type": "Offer",
    url: `${siteConfig.url}/products/${product.id}`,
    priceCurrency: "USD",
    price: product.price.toFixed(2),
    availability: product.inventory > 0 
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock",
    seller: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    validFrom: new Date().toISOString(),
    ...(product.inventory > 0 && product.inventory <= 10 && {
      inventoryLevel: {
        "@type": "QuantitativeValue",
        value: product.inventory,
      },
    }),
  };

  const aggregateRating = product.reviewCount > 0 ? {
    "@type": "AggregateRating",
    ratingValue: product.ratings.toFixed(1),
    reviewCount: product.reviewCount,
    bestRating: "5",
    worstRating: "1",
  } : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: product.brand || siteConfig.name,
    },
    category: product.category.replace("-", " "),
    images: product.images.map(img => 
      img.url.startsWith("http") ? img.url : `${siteConfig.url}${img.url}`
    ),
    offers,
    aggregateRating,
    ...(product.material && { material: product.material }),
    ...(product.color && { color: product.color }),
    ...(product.dimensions && {
      depth: {
        "@type": "QuantitativeValue",
        value: product.dimensions.length,
        unitCode: product.dimensions.unit === "cm" ? "CMT" : "INH",
      },
      width: {
        "@type": "QuantitativeValue",
        value: product.dimensions.width,
        unitCode: product.dimensions.unit === "cm" ? "CMT" : "INH",
      },
      height: {
        "@type": "QuantitativeValue",
        value: product.dimensions.height,
        unitCode: product.dimensions.unit === "cm" ? "CMT" : "INH",
      },
    }),
    ...(product.features.length > 0 && {
      additionalProperty: product.features.map(feature => ({
        "@type": "PropertyValue",
        name: "Feature",
        value: feature,
      })),
    }),
  };
}

export function generateProductListSchema(products: Product[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        url: `${siteConfig.url}/products/${product.id}`,
        image: product.images[0]?.url 
          ? (product.images[0].url.startsWith("http") ? product.images[0].url : `${siteConfig.url}${product.images[0].url}`)
          : undefined,
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: product.price.toFixed(2),
          availability: product.inventory > 0 
            ? "https://schema.org/InStock" 
            : "https://schema.org/OutOfStock",
        },
      },
    })),
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateLocalBusinessSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    image: `${siteConfig.url}/storefront.jpg`,
    description: siteConfig.description,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.address.split(",")[0],
      addressLocality: "New York",
      addressRegion: "NY",
      postalCode: "10001",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 40.7580,
      longitude: -73.9855,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "16:00",
      },
    ],
    priceRange: siteConfig.priceRange,
    paymentAccepted: siteConfig.paymentMethods.join(", "),
    currenciesAccepted: siteConfig.currencies.join(", "),
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image.startsWith("http") ? article.image : `${siteConfig.url}${article.image}`,
    url: article.url.startsWith("http") ? article.url : `${siteConfig.url}${article.url}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      "@type": "Person",
      name: article.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url.startsWith("http") ? article.url : `${siteConfig.url}${article.url}`,
    },
  };
}