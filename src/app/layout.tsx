import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { getLocale, isRtl } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cycleuae.com";

const DEFAULT_OG_IMAGE = "https://images.unsplash.com/photo-1741789597615-eefaca75fa7d?fm=jpg&q=80&w=1200&auto=format&fit=crop";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "UAE Bicycle — Premium Bikes & Cycling Gear, Cash on Delivery Across the UAE",
    template: "%s | UAE Bicycle",
  },
  description:
    "Shop mountain bikes, road bikes, e-bikes, city bikes, kids bikes, and cycling accessories online in the UAE. Fast delivery to Dubai, Abu Dhabi, Sharjah and all Emirates — pay Cash on Delivery.",
  keywords: [
    "bicycle shop UAE", "buy bike Dubai", "mountain bike UAE", "road bike Dubai",
    "e-bike UAE", "cycling accessories Dubai", "bike shop Abu Dhabi", "kids bike UAE",
    "cash on delivery bike UAE",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "UAE Bicycle",
    locale: "en_AE",
    title: "UAE Bicycle — Premium Bikes & Cycling Gear in the UAE",
    description: "Shop bikes and cycling gear online in the UAE. Cash on Delivery across all Emirates.",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "UAE Bicycle" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UAE Bicycle — Premium Bikes & Cycling Gear in the UAE",
    description: "Shop bikes and cycling gear online in the UAE. Cash on Delivery across all Emirates.",
    images: [DEFAULT_OG_IMAGE],
  },
};

// LocalBusiness is a stronger signal than a generic OnlineStore type for
// local search intent (e.g. "bike shop near me", "bike shop Dubai") —
// update the address/geo fields once the business's real details are final.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportingGoodsStore",
  name: "UAE Bicycle",
  url: SITE_URL,
  image: DEFAULT_OG_IMAGE,
  areaServed: {
    "@type": "Country",
    name: "United Arab Emirates",
  },
  priceRange: "AED",
  paymentAccepted: "Cash on Delivery",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const rtl = isRtl(locale);

  return (
    <html
      lang={locale}
      dir={rtl ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col ${rtl ? "font-[family-name:var(--font-arabic)]" : ""}`}>
        {/* eslint-disable-next-line react/no-danger */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
