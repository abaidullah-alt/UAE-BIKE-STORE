import type { NextConfig } from "next";

const securityHeaders = [
  // Prevents this site from being embedded in an iframe elsewhere (clickjacking protection)
  { key: "X-Frame-Options", value: "DENY" },
  // Stops browsers from trying to guess ("sniff") content types
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limits how much referrer info is sent to other sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disables powerful browser features this site doesn't use
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Basic Content Security Policy — allows self-hosted assets plus what
  // the app actually needs (Google Fonts, and images from any https host
  // since product images are URL-based for now). Tighten the img-src once
  // a single cloud storage provider is chosen.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Product images are URL-based (no upload storage yet — see SETUP.md),
      // so allow any https host until a single cloud storage provider is chosen.
      { protocol: "https", hostname: "**" },
    ],
  },
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
