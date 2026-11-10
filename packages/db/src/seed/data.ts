import type { PartialEntitlementSet } from "@olnktr/validators/entitlements";
import { DEFAULT_THEME_CONFIG, type ThemeConfig } from "@olnktr/validators/theme";

/**
 * Initial catalogue. The seed only *creates* missing rows: once a plan exists,
 * administrators manage its entitlements through the admin API, and re-running
 * the seed never overwrites those changes.
 */
export interface SeedPlan {
  key: string;
  name: string;
  description: string;
  isDefault: boolean;
  sortOrder: number;
  trialDays: number;
  entitlements: PartialEntitlementSet;
  prices: { interval: "month" | "year"; currency: string; amount: number }[];
}

export const SEED_PLANS: SeedPlan[] = [
  {
    key: "free",
    name: "Free",
    description: "One profile with the essentials.",
    isDefault: true,
    sortOrder: 0,
    trialDays: 0,
    entitlements: {
      "profiles.limit": 1,
      "links.limit": 50,
      "analytics.level": "basic",
      "analytics.history_days": 30,
      "themes.premium": false,
      "customization.advanced": false,
      "branding.removal": false,
      "api.access": false,
      "api.requests_per_minute": 0,
      "storage.limit": 100,
      "team.members.limit": 1,
    },
    prices: [],
  },
  {
    key: "pro",
    name: "Pro",
    description: "Multiple profiles, premium themes, advanced analytics and API access.",
    isDefault: false,
    sortOrder: 10,
    trialDays: 14,
    entitlements: {
      "profiles.limit": 5,
      "links.limit": null,
      "blocks.available_types": ["*"],
      "analytics.level": "advanced",
      "analytics.history_days": 365,
      "themes.premium": true,
      "customization.advanced": true,
      "branding.removal": true,
      "api.access": true,
      "api.requests_per_minute": 60,
      "storage.limit": 2048,
      "team.members.limit": 1,
    },
    prices: [
      { interval: "month", currency: "USD", amount: 600 },
      { interval: "year", currency: "USD", amount: 6000 },
      { interval: "month", currency: "TRY", amount: 19900 },
      { interval: "year", currency: "TRY", amount: 199000 },
    ],
  },
  {
    key: "business",
    name: "Business",
    description: "Teams, organizations, higher limits and quotas.",
    isDefault: false,
    sortOrder: 20,
    trialDays: 0,
    entitlements: {
      "profiles.limit": 25,
      "links.limit": null,
      "blocks.available_types": ["*"],
      "analytics.level": "advanced",
      "analytics.history_days": 730,
      "themes.premium": true,
      "customization.advanced": true,
      "branding.removal": true,
      "api.access": true,
      "api.requests_per_minute": 300,
      "storage.limit": 10240,
      "team.members.limit": 10,
    },
    prices: [
      { interval: "month", currency: "USD", amount: 2400 },
      { interval: "year", currency: "USD", amount: 24000 },
      { interval: "month", currency: "TRY", amount: 79900 },
      { interval: "year", currency: "TRY", amount: 799000 },
    ],
  },
];

export interface SeedTheme {
  key: string;
  name: string;
  description: string;
  isPremium: boolean;
  config: ThemeConfig;
}

export const SEED_THEMES: SeedTheme[] = [
  {
    key: "default",
    name: "Default",
    description: "Clean light theme.",
    isPremium: false,
    config: DEFAULT_THEME_CONFIG,
  },
  {
    key: "midnight",
    name: "Midnight",
    description: "High-contrast dark theme.",
    isPremium: false,
    config: {
      ...DEFAULT_THEME_CONFIG,
      colors: {
        background: "#09090b",
        surface: "#18181b",
        text: "#fafafa",
        mutedText: "#a1a1aa",
        accent: "#fafafa",
        accentText: "#09090b",
        border: "#27272a",
      },
    },
  },
  {
    key: "aurora",
    name: "Aurora",
    description: "Gradient theme with soft pill buttons.",
    isPremium: true,
    config: {
      ...DEFAULT_THEME_CONFIG,
      colors: {
        background: "#0f172a",
        surface: "#1e293b",
        text: "#f8fafc",
        mutedText: "#cbd5e1",
        accent: "#a78bfa",
        accentText: "#0f172a",
        border: "#334155",
      },
      background: { type: "gradient", from: "#0f172a", to: "#4c1d95", angle: 160 },
      buttons: { shape: "pill", variant: "soft", shadow: true },
    },
  },
];

export const SEED_SETTINGS: Record<string, unknown> = {
  "registration.enabled": true,
  "maintenance.enabled": false,
};
