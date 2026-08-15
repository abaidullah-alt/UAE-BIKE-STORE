import { Mail, Phone, Clock } from "lucide-react";
import { ContactForm } from "./contact-form";
import { getSetting } from "@/server/services/settings.service";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with the UAE Bicycle team — questions about bikes, orders, or anything else. Available 24 hours.",
};

export default async function ContactPage() {
  const [supportEmail, supportPhone] = await Promise.all([
    getSetting("supportEmail"),
    getSetting("supportPhone"),
  ]);

  const details = [
    { icon: Mail, label: "Email", value: supportEmail, href: `mailto:${supportEmail}` },
    { icon: Phone, label: "Phone", value: supportPhone, href: `tel:${supportPhone.replace(/\s/g, "")}` },
    { icon: Clock, label: "Availability", value: "Open 24 Hours — Every Day" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 animate-fade-up">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900">Get in Touch</h1>
        <p className="text-slate-500 mt-2">
          Questions about a bike, an order, or anything else — we're here around the clock.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12">
        <div className="space-y-6">
          {details.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                {href ? (
                  <a href={href} className="font-medium text-slate-900 hover:text-orange-600">
                    {value}
                  </a>
                ) : (
                  <p className="font-medium text-slate-900">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
