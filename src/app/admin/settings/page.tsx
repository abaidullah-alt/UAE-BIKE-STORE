import { getAllSettings } from "@/server/services/settings.service";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Store Settings</h1>
      <p className="text-sm text-slate-500 mb-6">
        These values are used across the storefront — the Contact page, footer, and checkout all read from here.
      </p>

      <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-xl">
        <SettingsForm
          fields={["storeName", "supportEmail", "supportPhone", "lowStockThreshold", "defaultTaxRate"]}
          defaultValues={settings}
        />
      </div>

      <p className="text-xs text-slate-400 mt-4 max-w-xl">
        Not VAT-registered, or don&apos;t want to charge tax? Set &quot;Default Tax Rate&quot; to 0 — new products will use
        that as their starting Tax Rate (you can still override it per product if needed).
      </p>

      <p className="text-xs text-slate-400 mt-2 max-w-xl">
        Looking for shipping rates? Those live on the{" "}
        <a href="/admin/shipping" className="text-orange-600 hover:underline">Zones & Rates</a> page.
      </p>
    </div>
  );
}
