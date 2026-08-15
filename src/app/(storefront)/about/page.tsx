import Image from "next/image";
import { MapPin, Users, Award, Heart } from "lucide-react";

export const metadata = {
  title: "About Us",
  description: "UAE Bicycle is a UAE-based bicycle and cycling gear store built for riders who take the road, trail, and city seriously.",
};

const values = [
  { icon: Award, title: "Quality First", desc: "Every bike and component is chosen for durability in UAE conditions — heat, sand, and long daily use." },
  { icon: MapPin, title: "Built for the UAE", desc: "From desert trails to city commutes, our range is curated for how people actually ride here." },
  { icon: Users, title: "Real Cyclists", desc: "Our team rides what we sell — advice comes from experience, not a script." },
  { icon: Heart, title: "Customer First", desc: "Fast delivery, honest advice, and easy returns — because a good bike shop earns trust over time." },
];

export default function AboutPage() {
  return (
    <div>
      <div className="relative h-72 sm:h-96">
        <Image
          src="https://images.unsplash.com/photo-1517649763962-0c623066013b?fm=jpg&q=80&w=2400&auto=format&fit=crop"
          alt="Group of cyclists riding together on an open road"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-950/50" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow-lg">About UAE Bicycle</h1>
            <p className="text-slate-200 mt-3 max-w-xl mx-auto drop-shadow">
              Premium bikes and cycling gear, built for how the UAE actually rides.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Story</h2>
        <p className="text-slate-600 leading-relaxed">
          UAE Bicycle started with a simple frustration: finding a bike shop in the UAE that understood
          both serious cycling and the realities of riding here — the heat, the terrain, the culture
          of early-morning rides before the sun gets too high. We built UAE Bicycle to be that shop online:
          a curated range of mountain bikes, road bikes, e-bikes, city bikes, kids bikes, and the gear
          that goes with them, backed by fast delivery across every Emirate and a team that actually rides.
        </p>
        <p className="text-slate-600 leading-relaxed mt-4">
          Whether you're training for your first century ride, commuting across Dubai, or picking out
          your kid's first bike, we're here to help you find the right one — not just sell you the
          most expensive option.
        </p>
      </div>

      <div className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                  <Icon className="h-6 w-6 text-orange-600" />
                </div>
                <p className="font-semibold text-slate-900 mt-3">{title}</p>
                <p className="text-sm text-slate-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
