export type ProductTier = "free" | "pro";

export type AppearanceFeature = {
  label: string;
  tier: ProductTier;
  fallback: unknown;
  proValues?: readonly unknown[];
};

export const FEATURE_CATALOG = {
  "background.mode": {
    label: "Arka plan türü",
    tier: "free",
    fallback: "gradient",
    proValues: ["image", "video", "particles", "motion"],
  },
  "background.solidColor": {
    label: "Düz renk",
    tier: "free",
    fallback: "#F5F0DE",
  },
  "background.gradient.type": {
    label: "Geçiş türü",
    tier: "pro",
    fallback: "linear",
  },
  "background.gradient.angle": {
    label: "Geçiş açısı",
    tier: "pro",
    fallback: 145,
  },
  "background.gradient.stops": {
    label: "Çok duraklı geçiş",
    tier: "pro",
    fallback: [
      { color: "#F5F0DE", position: 0 },
      { color: "#F8C95C", position: 100 },
    ],
  },
  "background.mediaUrl": {
    label: "Görsel veya video",
    tier: "pro",
    fallback: "",
  },
  "background.overlayColor": {
    label: "Medya kaplaması",
    tier: "pro",
    fallback: "#17211B",
  },
  "background.overlayOpacity": {
    label: "Kaplama yoğunluğu",
    tier: "pro",
    fallback: 18,
  },
  "background.preset": {
    label: "Arka plan paketi",
    tier: "free",
    fallback: "sunrise",
    proValues: ["aurora", "midnight", "mesh", "confetti", "custom"],
  },
  "buttons.shape": {
    label: "Düğme şekli",
    tier: "free",
    fallback: "rounded",
    proValues: ["custom"],
  },
  "buttons.radius": { label: "Özel köşe yarıçapı", tier: "pro", fallback: 18 },
  "buttons.fill": {
    label: "Düğme dolgusu",
    tier: "free",
    fallback: "shadow",
    proValues: ["glass", "threeD"],
  },
  "buttons.color": { label: "Düğme rengi", tier: "free", fallback: "#17211B" },
  "buttons.textColor": {
    label: "Düğme metni",
    tier: "free",
    fallback: "#FFFFFF",
  },
  "buttons.borderColor": {
    label: "Düğme kenarlığı",
    tier: "pro",
    fallback: "#17211B",
  },
  "buttons.shadowColor": {
    label: "Düğme gölgesi",
    tier: "pro",
    fallback: "#F06432",
  },
  "buttons.height": { label: "Düğme yüksekliği", tier: "pro", fallback: 58 },
  "buttons.spacing": { label: "Düğme aralığı", tier: "free", fallback: 12 },
  "buttons.hover": {
    label: "Düğme üzerine gelme",
    tier: "pro",
    fallback: "lift",
  },
  "buttons.press": {
    label: "Düğme basma efekti",
    tier: "pro",
    fallback: "compress",
  },
  "typography.headingFont": {
    label: "Başlık yazı tipi",
    tier: "free",
    fallback: "Fraunces",
    proValues: [
      "Space Grotesk",
      "Playfair Display",
      "DM Serif Display",
      "Bebas Neue",
    ],
  },
  "typography.bodyFont": {
    label: "Gövde yazı tipi",
    tier: "free",
    fallback: "Manrope",
    proValues: ["Inter", "Montserrat", "Lora", "Roboto Mono"],
  },
  "typography.headingSize": {
    label: "Başlık boyutu",
    tier: "pro",
    fallback: 30,
  },
  "typography.bodySize": { label: "Metin boyutu", tier: "pro", fallback: 15 },
  "typography.weight": {
    label: "Metin kalınlığı",
    tier: "free",
    fallback: 700,
  },
  "typography.letterSpacing": {
    label: "Harf aralığı",
    tier: "pro",
    fallback: 0,
  },
  "typography.color": {
    label: "Profil metin rengi",
    tier: "free",
    fallback: "#17211B",
  },
  "layout.avatarShape": {
    label: "Avatar şekli",
    tier: "free",
    fallback: "circle",
    proValues: ["squircle", "hexagon"],
  },
  "layout.avatarSize": { label: "Avatar boyutu", tier: "pro", fallback: 96 },
  "layout.avatarBorderWidth": {
    label: "Avatar kenarlığı",
    tier: "pro",
    fallback: 3,
  },
  "layout.avatarBorderColor": {
    label: "Avatar kenarlık rengi",
    tier: "pro",
    fallback: "#FFFFFF",
  },
  "layout.bioPlacement": {
    label: "Biyografi konumu",
    tier: "pro",
    fallback: "belowName",
  },
  "layout.alignment": {
    label: "Profil hizası",
    tier: "free",
    fallback: "center",
  },
  "layout.density": {
    label: "Yerleşim yoğunluğu",
    tier: "free",
    fallback: "comfortable",
    proValues: ["airy"],
  },
  "layout.contentWidth": {
    label: "İçerik genişliği",
    tier: "pro",
    fallback: 620,
  },
  "layout.socialPlacement": {
    label: "Sosyal ikon konumu",
    tier: "pro",
    fallback: "belowBio",
  },
  "effects.cursor": { label: "Özel imleç", tier: "pro", fallback: "default" },
  "effects.cursorColor": {
    label: "İmleç rengi",
    tier: "pro",
    fallback: "#F06432",
  },
  "effects.trail": { label: "İmleç izi", tier: "pro", fallback: "none" },
  "effects.clickRipple": {
    label: "Tıklama dalgası",
    tier: "pro",
    fallback: false,
  },
  "effects.entrance": {
    label: "Sayfa giriş animasyonu",
    tier: "pro",
    fallback: "fade",
  },
  "effects.staggerMs": {
    label: "Bağlantı gecikmesi",
    tier: "pro",
    fallback: 70,
  },
  "advanced.removeBranding": {
    label: "olnk markasını kaldır",
    tier: "pro",
    fallback: false,
  },
  "advanced.customCssEnabled": {
    label: "Özel CSS",
    tier: "pro",
    fallback: false,
  },
  "advanced.detailedAnalytics": {
    label: "Gelişmiş analiz",
    tier: "pro",
    fallback: false,
  },
} as const satisfies Record<string, AppearanceFeature>;

export type AppearanceFeaturePath = keyof typeof FEATURE_CATALOG;

export const FEATURE_GROUPS = [
  {
    id: "background",
    label: "Arka plan",
    paths: Object.keys(FEATURE_CATALOG).filter((key) =>
      key.startsWith("background."),
    ),
  },
  {
    id: "buttons",
    label: "Düğmeler",
    paths: Object.keys(FEATURE_CATALOG).filter((key) =>
      key.startsWith("buttons."),
    ),
  },
  {
    id: "typography",
    label: "Tipografi",
    paths: Object.keys(FEATURE_CATALOG).filter((key) =>
      key.startsWith("typography."),
    ),
  },
  {
    id: "layout",
    label: "Yerleşim",
    paths: Object.keys(FEATURE_CATALOG).filter((key) =>
      key.startsWith("layout."),
    ),
  },
  {
    id: "effects",
    label: "Etkileşim",
    paths: Object.keys(FEATURE_CATALOG).filter((key) =>
      key.startsWith("effects."),
    ),
  },
  {
    id: "advanced",
    label: "Gelişmiş",
    paths: Object.keys(FEATURE_CATALOG).filter((key) =>
      key.startsWith("advanced."),
    ),
  },
] as const;

export const CAPABILITY_CATALOG = {
  "links.buttonColor": { label: "Bağlantıya özel düğme rengi", tier: "pro" },
  "links.textColor": { label: "Bağlantıya özel metin rengi", tier: "pro" },
  "links.fontFamily": { label: "Bağlantıya özel yazı tipi", tier: "pro" },
  "links.iconStyle": { label: "Bağlantıya özel ikon stili", tier: "pro" },
  "links.scheduledStart": { label: "Planlı yayın başlangıcı", tier: "pro" },
  "links.scheduledEnd": { label: "Planlı yayın bitişi", tier: "pro" },
  "links.password": { label: "Tıklama parolası", tier: "pro" },
  "links.embedType": { label: "YouTube ve Spotify gömmeleri", tier: "pro" },
  "analytics.profileViews": { label: "Profil görüntülemeleri", tier: "pro" },
  "analytics.referrers": { label: "Yönlendiren kaynaklar", tier: "pro" },
  "analytics.geography": { label: "Coğrafi analiz", tier: "pro" },
  "analytics.devices": { label: "Cihaz analizi", tier: "pro" },
  "domains.custom": { label: "Özel alan adı", tier: "pro" },
  "assets.avatarUpload": { label: "Avatar yükleme", tier: "free" },
  "assets.backgroundUpload": {
    label: "Arka plan görseli veya videosu",
    tier: "pro",
  },
} as const satisfies Record<string, { label: string; tier: ProductTier }>;

export type CapabilityKey = keyof typeof CAPABILITY_CATALOG;
