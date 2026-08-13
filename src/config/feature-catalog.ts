export type ProductTier = "free" | "pro";

export type AppearanceFeature = {
  label: string;
  tier: ProductTier;
  fallback: unknown;
  proValues?: readonly unknown[];
};

export const FEATURE_CATALOG = {
  version: {
    label: "Ayar belgesi sürümü",
    tier: "free",
    fallback: 3,
  },
  preset: {
    label: "Tema paketi",
    tier: "free",
    fallback: "custom",
    proValues: ["frost", "midnight", "cyber", "terminal"],
  },
  "colors.primary": { label: "Ana renk", tier: "free", fallback: "#F06432" },
  "colors.secondary": {
    label: "İkincil renk",
    tier: "free",
    fallback: "#F8C95C",
  },
  "colors.accent": { label: "Vurgu rengi", tier: "free", fallback: "#B9DDC7" },
  "colors.background": {
    label: "Arka plan rengi",
    tier: "free",
    fallback: "#F5F0DE",
  },
  "colors.backgroundSecondary": {
    label: "İkincil arka plan",
    tier: "pro",
    fallback: "#F8C95C",
  },
  "colors.surface": { label: "Yüzey", tier: "free", fallback: "#FDFCF7" },
  "colors.surfaceHover": {
    label: "Yüzey vurgusu",
    tier: "pro",
    fallback: "#FFFFFF",
  },
  "colors.card": { label: "Kart rengi", tier: "free", fallback: "#FDFCF7" },
  "colors.cardBorder": {
    label: "Kart kenarlığı",
    tier: "free",
    fallback: "#FFFFFF",
  },
  "colors.textPrimary": {
    label: "Ana metin",
    tier: "free",
    fallback: "#17211B",
  },
  "colors.textSecondary": {
    label: "İkincil metin",
    tier: "free",
    fallback: "#36463D",
  },
  "colors.textMuted": {
    label: "Soluk metin",
    tier: "pro",
    fallback: "#64726A",
  },
  "colors.icon": { label: "İkon rengi", tier: "pro", fallback: "#17211B" },
  "colors.link": { label: "Bağlantı rengi", tier: "pro", fallback: "#17211B" },
  "colors.linkHover": {
    label: "Bağlantı vurgusu",
    tier: "pro",
    fallback: "#F06432",
  },
  "colors.glow": { label: "Parlama rengi", tier: "pro", fallback: "#F8C95C" },
  "colors.shadow": { label: "Gölge rengi", tier: "pro", fallback: "#17211B" },
  "colors.particle": {
    label: "Parçacık rengi",
    tier: "pro",
    fallback: "#FFFFFF",
  },
  "colors.username": {
    label: "Kullanıcı adı",
    tier: "pro",
    fallback: "#17211B",
  },
  "colors.badge": { label: "Rozet rengi", tier: "pro", fallback: "#F8C95C" },
  "colors.button": { label: "Düğme rengi", tier: "free", fallback: "#17211B" },
  "colors.buttonText": {
    label: "Düğme metni",
    tier: "free",
    fallback: "#FFFFFF",
  },
  "background.mode": {
    label: "Arka plan türü",
    tier: "free",
    fallback: "gradient",
    proValues: ["image", "video", "particles", "motion"],
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
  "background.fit": {
    label: "Medya boyutlandırma",
    tier: "pro",
    fallback: "cover",
  },
  "background.position": {
    label: "Medya konumu",
    tier: "pro",
    fallback: "center",
  },
  "background.blur": {
    label: "Arka plan bulanıklığı",
    tier: "pro",
    fallback: 0,
  },
  "background.brightness": {
    label: "Arka plan parlaklığı",
    tier: "pro",
    fallback: 100,
  },
  "background.contrast": {
    label: "Arka plan kontrastı",
    tier: "pro",
    fallback: 100,
  },
  "background.saturation": {
    label: "Arka plan doygunluğu",
    tier: "pro",
    fallback: 100,
  },
  "background.hueRotate": {
    label: "Arka plan renk dönüşü",
    tier: "pro",
    fallback: 0,
  },
  "background.scale": {
    label: "Arka plan yakınlaştırma",
    tier: "pro",
    fallback: 100,
  },
  "background.preset": {
    label: "Arka plan paketi",
    tier: "free",
    fallback: "sunrise",
    proValues: ["aurora", "midnight", "mesh", "confetti", "custom"],
  },
  "card.enabled": { label: "Profil kartı", tier: "free", fallback: false },
  "card.opacity": { label: "Kart opaklığı", tier: "free", fallback: 72 },
  "card.blur": { label: "Kart bulanıklığı", tier: "pro", fallback: 18 },
  "card.radius": { label: "Kart köşeleri", tier: "free", fallback: 32 },
  "card.borderWidth": { label: "Kart kenarlığı", tier: "pro", fallback: 1 },
  "card.borderStyle": {
    label: "Kart kenarlık biçimi",
    tier: "pro",
    fallback: "solid",
  },
  "card.shadow": { label: "Kart gölgesi", tier: "pro", fallback: "soft" },
  "card.hover": {
    label: "Kart etkileşimi",
    tier: "pro",
    fallback: "none",
  },
  "card.padding": { label: "Kart iç boşluğu", tier: "pro", fallback: 28 },
  "avatar.shape": {
    label: "Avatar şekli",
    tier: "free",
    fallback: "circle",
    proValues: ["squircle", "hexagon"],
  },
  "avatar.size": { label: "Avatar boyutu", tier: "pro", fallback: 96 },
  "avatar.borderWidth": {
    label: "Avatar kenarlığı",
    tier: "pro",
    fallback: 3,
  },
  "avatar.borderStyle": {
    label: "Avatar kenarlık biçimi",
    tier: "pro",
    fallback: "solid",
  },
  "avatar.shadow": {
    label: "Avatar gölgesi",
    tier: "pro",
    fallback: "hard",
  },
  "avatar.animation": {
    label: "Avatar animasyonu",
    tier: "pro",
    fallback: "none",
  },
  "avatar.hover": {
    label: "Avatar etkileşimi",
    tier: "pro",
    fallback: "none",
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
  "typography.headingEffect": {
    label: "Başlık efekti",
    tier: "pro",
    fallback: "none",
  },
  "layout.template": {
    label: "Profil düzeni",
    tier: "free",
    fallback: "stack",
    proValues: ["bento", "terminal"],
  },
  "layout.cardPosition": {
    label: "Kart konumu",
    tier: "pro",
    fallback: "center",
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
  "layout.mobileAlignment": {
    label: "Mobil hizalama",
    tier: "pro",
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
  "layout.pagePadding": {
    label: "Masaüstü sayfa boşluğu",
    tier: "pro",
    fallback: 28,
  },
  "layout.mobilePagePadding": {
    label: "Mobil sayfa boşluğu",
    tier: "free",
    fallback: 20,
  },
  "layout.verticalAlign": {
    label: "Dikey konum",
    tier: "pro",
    fallback: "top",
  },
  "layout.socialPlacement": {
    label: "Sosyal ikon konumu",
    tier: "pro",
    fallback: "belowBio",
  },
  "effects.cursor": { label: "Özel imleç", tier: "pro", fallback: "default" },
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
  "effects.mouseParticles": {
    label: "Fareyi izleyen parçacıklar",
    tier: "pro",
    fallback: "off",
  },
  "effects.cardTilt": {
    label: "3B kart eğimi",
    tier: "pro",
    fallback: "off",
  },
  "effects.matrixRain": {
    label: "Matrix yağmuru",
    tier: "pro",
    fallback: "off",
  },
  "effects.crtFilter": {
    label: "CRT filtresi",
    tier: "pro",
    fallback: false,
  },
  "effects.glitch": {
    label: "Glitch efekti",
    tier: "pro",
    fallback: false,
  },
  "effects.scanlines": {
    label: "Tarama çizgileri",
    tier: "pro",
    fallback: false,
  },
  "audio.enabled": {
    label: "Profil müziği",
    tier: "free",
    fallback: false,
  },
  "audio.source": {
    label: "Ses kaynağı",
    tier: "free",
    fallback: "none",
    proValues: ["upload"],
  },
  "audio.sourceUrl": {
    label: "Ses adresi",
    tier: "free",
    fallback: "",
  },
  "audio.title": {
    label: "Parça başlığı",
    tier: "free",
    fallback: "",
  },
  "audio.volume": {
    label: "Başlangıç ses düzeyi",
    tier: "free",
    fallback: 70,
  },
  "audio.loop": {
    label: "Sürekli tekrar",
    tier: "pro",
    fallback: false,
  },
  "audio.skin": {
    label: "Oynatıcı görünümü",
    tier: "free",
    fallback: "minimal",
    proValues: ["glass", "retro"],
  },
  "audio.accentColor": {
    label: "Oynatıcı vurgu rengi",
    tier: "pro",
    fallback: "#F06432",
  },
  "audio.entryEnabled": {
    label: "Giriş sesi",
    tier: "pro",
    fallback: false,
  },
  "audio.entryUrl": {
    label: "Giriş sesi dosyası",
    tier: "pro",
    fallback: "",
  },
  "audio.entryVolume": {
    label: "Giriş sesi düzeyi",
    tier: "pro",
    fallback: 65,
  },
  "socialProof.enabled": {
    label: "Ziyaretçi sayacı",
    tier: "free",
    fallback: false,
  },
  "socialProof.metric": {
    label: "Sayaç ölçümü",
    tier: "free",
    fallback: "total",
    proValues: ["live"],
  },
  "socialProof.style": {
    label: "Sayaç görünümü",
    tier: "free",
    fallback: "plain",
    proValues: ["retro"],
  },
  "socialProof.label": {
    label: "Sayaç etiketi",
    tier: "free",
    fallback: "",
  },
  "seo.title": { label: "SEO başlığı", tier: "free", fallback: "" },
  "seo.description": { label: "SEO açıklaması", tier: "free", fallback: "" },
  "seo.imageUrl": { label: "SEO görseli", tier: "pro", fallback: "" },
  "privacy.allowIndexing": {
    label: "Arama motorlarında görünürlük",
    tier: "free",
    fallback: true,
  },
  "privacy.analyticsEnabled": {
    label: "Ziyaret analitiği",
    tier: "free",
    fallback: true,
  },
  "privacy.showShareActions": {
    label: "Paylaşım araçları",
    tier: "free",
    fallback: true,
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
    id: "colors",
    label: "Renk sistemi",
    paths: Object.keys(FEATURE_CATALOG).filter((key) =>
      key.startsWith("colors."),
    ),
  },
  {
    id: "background",
    label: "Arka plan",
    paths: Object.keys(FEATURE_CATALOG).filter((key) =>
      key.startsWith("background."),
    ),
  },
  {
    id: "card",
    label: "Profil kartı",
    paths: Object.keys(FEATURE_CATALOG).filter((key) =>
      key.startsWith("card."),
    ),
  },
  {
    id: "avatar",
    label: "Avatar",
    paths: Object.keys(FEATURE_CATALOG).filter((key) =>
      key.startsWith("avatar."),
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
    id: "audio",
    label: "Ses",
    paths: Object.keys(FEATURE_CATALOG).filter((key) =>
      key.startsWith("audio."),
    ),
  },
  {
    id: "socialProof",
    label: "Sosyal kanıt",
    paths: Object.keys(FEATURE_CATALOG).filter((key) =>
      key.startsWith("socialProof."),
    ),
  },
  {
    id: "seo",
    label: "SEO",
    paths: Object.keys(FEATURE_CATALOG).filter((key) => key.startsWith("seo.")),
  },
  {
    id: "privacy",
    label: "Gizlilik",
    paths: Object.keys(FEATURE_CATALOG).filter((key) =>
      key.startsWith("privacy."),
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
  "assets.audioUpload": {
    label: "Doğrudan ses dosyası yükleme",
    tier: "pro",
  },
  "assets.entrySoundUpload": {
    label: "Giriş sesi yükleme",
    tier: "pro",
  },
  "profiles.password": {
    label: "Profil parolası",
    tier: "pro",
  },
} as const satisfies Record<string, { label: string; tier: ProductTier }>;

export type CapabilityKey = keyof typeof CAPABILITY_CATALOG;
