import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { PageViewTracker } from "@/components/storefront/page-view-tracker";
import { getCartItemCount } from "@/server/services/cart.service";
import { getLocale, getDictionary } from "@/lib/i18n/config";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartCount, locale, dict] = await Promise.all([
    getCartItemCount(),
    getLocale(),
    getDictionary(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <PageViewTracker />
      <Header cartCount={cartCount} locale={locale} dict={dict} />
      <main className="flex-1">{children}</main>
      <Footer dict={dict} />
    </div>
  );
}
