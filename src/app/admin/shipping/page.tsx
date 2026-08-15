import { getAllSettings } from "@/server/services/settings.service";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminShippingPage() {
  const settings = await getAllSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Shipping — Zones & Rates</h1>
      <p className="text-sm text-slate-500 mb-6">
        These rates are used live at checkout. Currently two zones: Dubai/Sharjah/Ajman (&quot;near&quot;), and the rest of the UAE (&quot;far&quot;).
      </p>

      <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-xl">
        <SettingsForm
          fields={["freeShippingThreshold", "nearZoneShippingRate", "nearZoneExpressRate", "farZoneShippingRate"]}
          defaultValues={settings}
        />
      </div>

      <div className="mt-6 max-w-xl bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-500">
        <p className="font-medium text-slate-700 mb-1">How this works right now</p>
        <p>
          Orders are marked as shipped manually from the Orders page once you hand them to a courier — there&apos;s no live
          courier API connected yet. Tracking numbers you enter there show up on the customer&apos;s order page.
        </p>
      </div>
    </div>
  );
}
