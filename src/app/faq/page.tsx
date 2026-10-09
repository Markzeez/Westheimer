import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronDown, MessageCircle, PackageCheck, RotateCcw, Truck } from 'lucide-react';
import { Header } from '@/component/Header';
import { Footer } from '@/component/Footer';
import { siteConfig } from '@/lib/seo/config';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Find answers about ordering, delivery, returns, warranties, and caring for Westheimer Designs furniture.',
  alternates: { canonical: `${siteConfig.url}/faq` },
  openGraph: {
    title: `Frequently Asked Questions | ${siteConfig.name}`,
    description:
      'Answers about orders, delivery, returns, warranties, and furniture care.',
    url: `${siteConfig.url}/faq`,
    siteName: siteConfig.name,
    type: 'website',
  },
};

const faqSections = [
  {
    id: 'orders',
    title: 'Orders and products',
    icon: PackageCheck,
    questions: [
      {
        question: 'How do I place an order?',
        answer:
          'Add the pieces you want to your cart, then follow checkout to enter your delivery details and payment information. You can review your order before confirming it.',
      },
      {
        question: 'Can I customize my furniture?',
        answer:
          'Some pieces offer choices such as fabric, finish, or configuration. Available options are shown on the product page.',
      },
      {
        question: 'Where can I see my order details?',
        answer:
          'Sign in and open My Account to review your order history. Once an order ships, its tracking information will be available there when provided.',
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Shipping and delivery',
    icon: Truck,
    questions: [
      {
        question: 'How much does shipping cost?',
        answer:
          'Standard shipping is free on orders over ₦500. Delivery options and any applicable charges are shown during checkout.',
      },
      {
        question: 'When will my order arrive?',
        answer:
          'Standard shipping typically takes 5–7 business days. Larger furniture or special delivery arrangements may take longer; we will share updates when available.',
      },
      {
        question: 'Can I track my order?',
        answer:
          'When a tracking number is available, you can find it in your account under your order details. Shipping updates are also sent by email.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns and warranty',
    icon: RotateCcw,
    questions: [
      {
        question: 'What is your return policy?',
        answer:
          'Our 100-day trial lets you decide if a piece is right for your home. Returned items must be in original condition. Contact support to arrange a return and confirm the applicable process.',
      },
      {
        question: 'What does the warranty cover?',
        answer:
          'Frames have a lifetime warranty, cushions and mechanisms are covered for 5 years, and fabrics and finishes are covered for 1 year. Contact support with your order details for help with a claim.',
      },
    ],
  },
  {
    id: 'care',
    title: 'Care and support',
    icon: MessageCircle,
    questions: [
      {
        question: 'How should I care for my furniture?',
        answer:
          'Care needs vary by material and finish. Follow the care guidance included with your item, and contact our team if you need advice for a specific piece.',
      },
      {
        question: 'How can I contact customer support?',
        answer:
          'Use our contact page to send a message about an order, return, warranty claim, or general question. Include your order number when applicable.',
      },
    ],
  },
];

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqSections.flatMap((section) =>
    section.questions.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    }))
  ),
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <Header />

      <main>
        <section className="border-b border-gray-200 bg-gray-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-700">
              Customer support
            </p>
            <h1 className="max-w-3xl text-4xl font-bold text-gray-950 sm:text-5xl">
              Frequently asked questions
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-7 text-gray-600">
              Clear answers about choosing, ordering, and caring for furniture made for everyday living.
            </p>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8 lg:py-16">
          <nav aria-label="FAQ topics" className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Browse topics
            </p>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {faqSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-950"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </nav>

          <div className="space-y-12">
            {faqSections.map((section) => {
              const Icon = section.icon;
              return (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-4">
                    <Icon aria-hidden="true" className="size-5 text-teal-700" />
                    <h2 className="text-xl font-semibold text-gray-950">{section.title}</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {section.questions.map(({ question, answer }) => (
                      <details key={question} className="group py-5">
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left font-medium text-gray-900 [&::-webkit-details-marker]:hidden">
                          <span>{question}</span>
                          <ChevronDown
                            aria-hidden="true"
                            className="mt-0.5 size-5 shrink-0 text-gray-500 transition-transform group-open:rotate-180"
                          />
                        </summary>
                        <p className="max-w-3xl pt-3 pr-8 leading-7 text-gray-600">{answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              );
            })}

            <aside className="flex flex-col gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-gray-950">Still need help?</h2>
                <p className="mt-1 text-sm text-gray-600">Our team can help with your specific question.</p>
              </div>
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
              >
                Contact support
              </Link>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}