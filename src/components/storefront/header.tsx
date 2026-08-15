import Link from "next/link";
import { User, Heart, ShoppingCart, Menu } from "lucide-react";
import { SearchBox } from "@/components/storefront/search-box";
import { LanguageSwitcher } from "@/components/storefront/language-switcher";
import type { Locale } from "@/lib/i18n/config";
import en from "../../../messages/en.json";

interface Props {
  cartCount?: number;
  locale: Locale;
  dict: typeof en;
}

export function Header({ cartCount = 0, locale, dict }: Props) {
  const categories = [
    { name: dict.nav.mountainBikes, href: "/categories/mountain-bikes" },
    { name: dict.nav.roadBikes, href: "/categories/road-bikes" },
    { name: dict.nav.eBikes, href: "/categories/e-bikes" },
    { name: dict.nav.cityBikes, href: "/categories/city-bikes" },
    { name: dict.nav.kidsBikes, href: "/categories/kids-bikes" },
    { name: dict.nav.accessories, href: "/categories/accessories" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      {/* Announcement bar — moving marquee, Cash on Delivery only */}
      <div className="bg-slate-900 text-white text-xs sm:text-sm py-2 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="mx-8 inline-flex items-center gap-2">
              💵 {dict.nav.announcement}
            </span>
          ))}
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <button className="lg:hidden text-slate-700" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-black tracking-tight text-slate-900">
              UAE<span className="text-orange-600"> BICYCLE</span>
            </span>
          </Link>

          <SearchBox placeholder={dict.nav.search} />

          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher currentLocale={locale} />
            <Link href="/account" aria-label={dict.nav.account} className="p-2 text-slate-700 hover:text-orange-600">
              <User className="h-5 w-5" />
            </Link>
            <Link href="/account/wishlist" aria-label={dict.nav.wishlist} className="p-2 text-slate-700 hover:text-orange-600">
              <Heart className="h-5 w-5" />
            </Link>
            <Link href="/cart" aria-label={dict.nav.cart} className="relative p-2 text-slate-700 hover:text-orange-600">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 end-0 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Category nav */}
        <nav className="hidden lg:flex items-center gap-8 h-12 border-t border-slate-100">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="text-sm font-medium text-slate-700 hover:text-orange-600 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
