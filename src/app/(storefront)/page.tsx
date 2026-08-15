import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Truck, ShieldCheck, RotateCcw, Headphones, Star } from "lucide-react";
import { getFeaturedProducts } from "@/server/services/catalog.service";
import { ProductCard } from "@/components/storefront/product-card";
import { getDictionary } from "@/lib/i18n/config";

export default async function HomePage() {
  const [featured, dict] = await Promise.all([getFeaturedProducts(8), getDictionary()]);

  const categories = [
    { name: dict.nav.mountainBikes, href: "/categories/mountain-bikes", emoji: "🚵" },
    { name: dict.nav.roadBikes, href: "/categories/road-bikes", emoji: "🚴" },
    { name: dict.nav.eBikes, href: "/categories/e-bikes", emoji: "⚡" },
    { name: dict.nav.cityBikes, href: "/categories/city-bikes", emoji: "🏙️" },
    { name: dict.nav.kidsBikes, href: "/categories/kids-bikes", emoji: "🧒" },
    { name: dict.nav.accessories, href: "/categories/accessories", emoji: "🎒" },
  ];

  const whyShopWithUs = [
    { icon: Truck, title: dict.home.uaeDelivery, desc: dict.home.uaeDeliveryDesc },
    { icon: ShieldCheck, title: dict.home.securePayments, desc: dict.home.securePaymentsDesc },
    { icon: RotateCcw, title: dict.home.easyReturns, desc: dict.home.easyReturnsDesc },
    { icon: Headphones, title: dict.home.realSupport, desc: dict.home.realSupportDesc },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative text-white overflow-hidden min-h-[560px] flex items-center">
        <Image
          src="https://images.unsplash.com/photo-1741789597615-eefaca75fa7d?fm=jpg&q=80&w=2400&auto=format&fit=crop"
          alt="Open desert road at sunset"
          fill
          priority
          className="object-cover scale-105 animate-[float_12s_ease-in-out_infinite]"
          sizes="100vw"
        />
        {/* Dark gradient overlay for text readability over the photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative z-10">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-block text-xs font-bold tracking-widest text-orange-400 uppercase mb-4 animate-float">
              {dict.home.heroTag}
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] drop-shadow-lg">
              {dict.home.heroTitle1}
              <br />
              {dict.home.heroTitle2}
            </h1>
            <p className="mt-6 text-lg text-slate-200 max-w-lg drop-shadow">
              {dict.home.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="transition-transform hover:scale-105" asChild>
                <Link href="/shop">{dict.home.shopBikes}</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/5 text-white border-white/40 hover:bg-white/15 backdrop-blur-sm transition-transform hover:scale-105" asChild>
                <Link href="/categories/accessories">{dict.home.exploreAccessories}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by category */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 animate-fade-up">
          {dict.home.shopByCategory}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`group flex flex-col items-center gap-3 rounded-xl border border-slate-200 p-6 hover:border-orange-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up animate-delay-${Math.min(i + 1, 6)}`}
            >
              <span className="text-4xl transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">{cat.emoji}</span>
              <span className="text-sm font-semibold text-slate-800 text-center group-hover:text-orange-600">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 animate-fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {dict.home.featuredBikes}
            </h2>
            <Link href="/shop" className="text-sm font-semibold text-orange-600 hover:underline">
              {dict.home.viewAll} →
            </Link>
          </div>
          {featured.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product, i) => (
                <div key={product.id} className={`animate-fade-up animate-delay-${Math.min(i + 1, 6)} transition-transform duration-300 hover:-translate-y-1`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
              {dict.home.noFeatured}
            </div>
          )}
        </div>
      </section>

      {/* Why shop with us */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {whyShopWithUs.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className={`flex flex-col items-center text-center gap-3 animate-fade-up animate-delay-${Math.min(i + 1, 6)}`}>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:bg-orange-200">
                <Icon className="h-6 w-6 text-orange-600" />
              </div>
              <p className="font-semibold text-slate-900">{title}</p>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews teaser */}
      <section className="bg-slate-900 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center animate-fade-up">
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-5 w-5 fill-orange-400 text-orange-400 animate-fade-up animate-delay-${Math.min(i + 1, 6)}`} />
            ))}
          </div>
          <p className="text-xl font-medium max-w-2xl mx-auto">
            {dict.home.reviewsTeaser}
          </p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-up">
        <h2 className="text-2xl font-bold text-slate-900">{dict.home.newsletterTitle}</h2>
        <p className="text-slate-500 mt-2">
          {dict.home.newsletterSubtitle}
        </p>
      </section>
    </>
  );
}
