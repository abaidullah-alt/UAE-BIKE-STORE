import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type en from "../../../messages/en.json";

export function Footer({ dict }: { dict: typeof en }) {
  const footerLinks = {
    [dict.footer.shop]: [
      { name: dict.footer.allBikes, href: "/shop" },
      { name: dict.nav.eBikes, href: "/categories/e-bikes" },
      { name: dict.nav.accessories, href: "/categories/accessories" },
      { name: dict.footer.newArrivals, href: "/new-arrivals" },
      { name: dict.footer.specialOffers, href: "/offers" },
    ],
    [dict.footer.support]: [
      { name: dict.footer.contactUs, href: "/contact" },
      { name: dict.footer.faq, href: "/faq" },
      { name: dict.footer.shippingPolicy, href: "/policies/shipping" },
      { name: dict.footer.returnsPolicy, href: "/policies/returns" },
      { name: dict.footer.sizeGuide, href: "/guides/size-guide" },
    ],
    [dict.footer.company]: [
      { name: dict.footer.aboutUs, href: "/about" },
      { name: dict.footer.privacyPolicy, href: "/policies/privacy" },
      { name: dict.footer.termsConditions, href: "/policies/terms" },
    ],
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <span className="text-2xl font-black tracking-tight text-white">
              UAE<span className="text-orange-500"> BICYCLE</span>
            </span>
            <p className="mt-4 text-sm text-slate-400 max-w-sm">
              {dict.footer.tagline}
            </p>
            <div className="mt-6">
              <p className="text-sm font-semibold text-white mb-2">{dict.footer.joinRide}</p>
              <form className="flex gap-2 max-w-sm">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <Button type="submit" size="default">
                  {dict.footer.subscribe}
                </Button>
              </form>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="text-sm font-semibold text-white mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-orange-500 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} UAE Bicycle. {dict.footer.rights}</p>
          <p>{dict.footer.paymentNote}</p>
        </div>
      </div>
    </footer>
  );
}
