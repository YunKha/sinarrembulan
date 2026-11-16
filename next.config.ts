import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Gambar konten disimpan di Supabase Storage; next/image mengubahnya ke WebP/AVIF berukuran pas.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
};

export default nextConfig;
