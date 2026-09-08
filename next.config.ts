import type { NextConfig } from "next";

function allowedDevOrigins(): string[] {
  const origins = [
    "*.trycloudflare.com",
    "*.ngrok-free.app",
    "*.ngrok.app",
    "*.loca.lt",
    "*.lhr.life",
  ];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      origins.unshift(new URL(appUrl).hostname);
    } catch {
      /* ignore invalid NEXT_PUBLIC_APP_URL */
    }
  }
  return origins;
}

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: allowedDevOrigins(),
  serverExternalPackages: ["mongodb"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
