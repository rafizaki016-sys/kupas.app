import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "id.kupas.app",
  appName: "Kupas",
  webDir: "out",
  server: {
    // Ganti dengan URL Vercel produksi milikmu setelah deploy
    url: "https://kupas-app-rz5g.vercel.app/",
    cleartext: false,
  },
};

export default config;
