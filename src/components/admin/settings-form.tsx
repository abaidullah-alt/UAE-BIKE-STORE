"use client";

import { useState } from "react";
import { updateSettingsAction } from "@/server/actions/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const FIELD_CONFIG: Record<string, { label: string; type: string; prefix?: string }> = {
  storeName: { label: "Store Name", type: "text" },
  supportEmail: { label: "Support Email", type: "email" },
  supportPhone: { label: "Support Phone", type: "text" },
  lowStockThreshold: { label: "Low Stock Alert Threshold (units)", type: "number" },
  defaultTaxRate: { label: "Default Tax Rate for New Products (%)", type: "number" },
  freeShippingThreshold: { label: "Free Shipping Threshold", type: "number", prefix: "AED" },
  nearZoneShippingRate: { label: "Standard Delivery — Dubai/Sharjah/Ajman", type: "number", prefix: "AED" },
  nearZoneExpressRate: { label: "Express Delivery — Dubai/Sharjah/Ajman", type: "number", prefix: "AED" },
  farZoneShippingRate: { label: "Standard Delivery — Other Emirates", type: "number", prefix: "AED" },
};

interface Props {
  fields: string[];
  defaultValues: Record<string, string>;
}

export function SettingsForm({ fields, defaultValues }: Props) {
  const [values, setValues] = useState(defaultValues);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaved(false);

    const payload: Record<string, string> = {};
    for (const field of fields) payload[field] = values[field];

    const result = await updateSettingsAction(payload);
    setIsSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => {
        const config = FIELD_CONFIG[field];
        if (!config) return null;
        return (
          <div key={field} className="space-y-1.5">
            <Label htmlFor={field}>{config.label}</Label>
            <div className="flex items-center gap-2">
              {config.prefix && <span className="text-sm text-slate-400">{config.prefix}</span>}
              <Input
                id={field}
                type={config.type}
                value={values[field] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
              />
            </div>
          </div>
        );
      })}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">Settings saved.</p>}

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
