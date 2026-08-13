export const USERNAME_POLICY = {
  minLength: 3,
  maxLength: 30,

  /**
   * Reserved usernames
   *
   * These names are reserved for:
   * - system routes
   * - administration
   * - authentication
   * - official OLNK accounts
   * - infrastructure
   * - support/security
   * - future features
   *
   * These should generally be checked as exact normalized matches.
   */
  reserved: [
    // ------------------------------------------------------------
    // OLNK / Brand
    // ------------------------------------------------------------
    "olnk",
    "olnktr",
    "olnk-tr",
    "olnkofficial",
    "officialolnk",
    "olnksupport",
    "olnkadmin",
    "olnkteam",
    "olnkstaff",
    "olnkmoderator",
    "olnkmod",
    "olnksecurity",
    "olnkhelp",
    "olnkstatus",
    "olnkapi",
    "olnkdev",
    "olnkdeveloper",
    "olnkmail",
    "olnkbot",
    "olnksystem",

    // ------------------------------------------------------------
    // Root / System
    // ------------------------------------------------------------
    "root",
    "system",
    "systemadmin",
    "sysadmin",
    "administrator",
    "administration",
    "admin",
    "admins",
    "superadmin",
    "superuser",
    "sudo",
    "operator",
    "owner",
    "staff",
    "team",
    "official",
    "verified",
    "verification",
    "verify",
    "moderator",
    "moderators",
    "mod",
    "mods",
    "management",
    "manager",

    // ------------------------------------------------------------
    // Authentication
    // ------------------------------------------------------------
    "auth",
    "authentication",
    "authorize",
    "authorization",
    "login",
    "logout",
    "signin",
    "signout",
    "signup",
    "register",
    "registration",
    "account",
    "accounts",
    "user",
    "users",
    "profile",
    "profiles",
    "session",
    "sessions",
    "password",
    "passwd",
    "forgot",
    "forgotpassword",
    "reset",
    "resetpassword",
    "recover",
    "recovery",
    "oauth",
    "oauth2",
    "sso",
    "callback",
    "callbacks",
    "token",
    "tokens",
    "refresh",
    "activate",
    "activation",
    "confirm",
    "confirmation",
    "mfa",
    "2fa",
    "otp",

    // Turkish authentication
    "giris",
    "girisyap",
    "cikis",
    "cikisyap",
    "kayit",
    "kayitol",
    "hesap",
    "hesabim",
    "profil",
    "sifre",
    "sifrem",
    "sifresifirla",
    "dogrula",
    "dogrulama",

    // ------------------------------------------------------------
    // Main site routes
    // ------------------------------------------------------------
    "home",
    "homepage",
    "index",
    "main",
    "app",
    "web",
    "website",
    "site",
    "about",
    "aboutus",
    "contact",
    "contactus",
    "help",
    "support",
    "faq",
    "docs",
    "documentation",
    "guide",
    "guides",
    "tutorial",
    "tutorials",
    "blog",
    "news",
    "updates",
    "changelog",
    "roadmap",
    "status",
    "pricing",
    "price",
    "plans",
    "premium",
    "pro",
    "enterprise",
    "business",
    "careers",
    "jobs",
    "legal",
    "privacy",
    "terms",
    "tos",
    "policy",
    "policies",
    "rules",
    "community",
    "explore",
    "discover",
    "search",
    "new",
    "create",
    "edit",
    "delete",
    "settings",
    "preferences",
    "dashboard",
    "panel",
    "console",

    // Turkish site routes
    "anasayfa",
    "ana-sayfa",
    "hakkimizda",
    "iletisim",
    "yardim",
    "destek",
    "belgeler",
    "dokuman",
    "dokumantasyon",
    "haberler",
    "guncellemeler",
    "fiyat",
    "fiyatlar",
    "paketler",
    "kariyer",
    "isler",
    "yasal",
    "gizlilik",
    "kosullar",
    "kurallar",
    "topluluk",
    "kesfet",
    "arama",
    "ara",
    "ayarlar",
    "panelim",
    "yonetim",

    // ------------------------------------------------------------
    // Developer / API
    // ------------------------------------------------------------
    "api",
    "apis",
    "api-v1",
    "api-v2",
    "v1",
    "v2",
    "v3",
    "graphql",
    "graphiql",
    "trpc",
    "rpc",
    "rest",
    "webhook",
    "webhooks",
    "socket",
    "sockets",
    "websocket",
    "ws",
    "developer",
    "developers",
    "dev",
    "development",
    "sandbox",
    "staging",
    "production",
    "prod",
    "test",
    "testing",
    "beta",
    "alpha",
    "internal",

    // ------------------------------------------------------------
    // Static / infrastructure
    // ------------------------------------------------------------
    "www",
    "www1",
    "www2",
    "cdn",
    "static",
    "assets",
    "asset",
    "media",
    "uploads",
    "upload",
    "files",
    "file",
    "images",
    "image",
    "img",
    "icons",
    "icon",
    "favicon",
    "fonts",
    "font",
    "css",
    "js",
    "javascript",
    "scripts",
    "robots",
    "robots.txt",
    "sitemap",
    "sitemap.xml",
    "manifest",
    "manifest.json",

    // ------------------------------------------------------------
    // Network / mail / infrastructure
    // ------------------------------------------------------------
    "mail",
    "email",
    "smtp",
    "imap",
    "pop",
    "pop3",
    "mx",
    "dns",
    "ns",
    "ns1",
    "ns2",
    "ftp",
    "sftp",
    "ssh",
    "vpn",
    "proxy",
    "gateway",
    "router",
    "localhost",
    "local",
    "host",
    "server",
    "servers",
    "node",
    "nodes",
    "cloud",
    "storage",
    "database",
    "db",
    "postgres",
    "postgresql",
    "mysql",
    "redis",
    "cache",
    "queue",
    "worker",
    "workers",

    // ------------------------------------------------------------
    // Security
    // ------------------------------------------------------------
    "security",
    "secure",
    "trust",
    "safety",
    "abuse",
    "report",
    "reports",
    "fraud",
    "antifraud",
    "compliance",
    "legalteam",
    "securityteam",
    "supportteam",
    "supportadmin",
    "supportstaff",
    "helpdesk",

    "guvenlik",
    "guvenli",
    "sikayet",
    "bildir",
    "rapor",
    "dolandiricilik",

    // ------------------------------------------------------------
    // Payments / commercial
    // ------------------------------------------------------------
    "payment",
    "payments",
    "pay",
    "billing",
    "invoice",
    "invoices",
    "checkout",
    "shop",
    "store",
    "market",
    "marketplace",
    "order",
    "orders",
    "subscription",
    "subscriptions",
    "wallet",
    "balance",

    "odeme",
    "odemeler",
    "fatura",
    "faturalar",
    "magaza",
    "market",
    "siparis",
    "siparisler",
    "abonelik",
    "bakiye",
    "cuzdan",

    // ------------------------------------------------------------
    // URL / redirection system
    // ------------------------------------------------------------
    "go",
    "link",
    "links",
    "url",
    "urls",
    "redirect",
    "redirects",
    "short",
    "shortener",
    "shortlink",
    "shortlinks",
    "bio",
    "linkinbio",

    // ------------------------------------------------------------
    // Common reserved files / paths
    // ------------------------------------------------------------
    "404",
    "403",
    "500",
    "error",
    "errors",
    "health",
    "healthcheck",
    "ping",
    "metrics",
    "monitor",
    "monitoring",
    "debug",
    "logs",
    "log",
    "config",
    "configuration",
    "env",
    "environment",
    "setup",
    "install",
    "installer",
    "maintenance",

    // ------------------------------------------------------------
    // Common official account impersonation
    // ------------------------------------------------------------
    "ceo",
    "cto",
    "cfo",
    "founder",
    "founders",
    "cofounder",
    "developerteam",
    "adminteam",
    "moderation",
    "moderationteam",
    "officialsupport",
    "officialadmin",
    "officialstaff",
    "officialteam",

    // ------------------------------------------------------------
    // Automation / bots
    // ------------------------------------------------------------
    "bot",
    "bots",
    "robot",
    "automated",
    "automation",
    "systembot",
    "adminbot",
    "supportbot",
    "moderatorbot",
  ],

  /**
   * Blocked username terms.
   *
   * IMPORTANT:
   * Do not only compare the raw username against this list.
   *
   * Recommended normalization:
   * - lowercase
   * - Unicode NFKD/NFKC
   * - Turkish character normalization
   * - leetspeak normalization
   * - repeated-character collapsing
   * - punctuation removal
   *
   * Example:
   * s.1.k.t.1.r -> siktir
   * p0rnhub -> pornhub
   * n@zi -> nazi
   */
  defaultBlockedTerms: [
    // ============================================================
    // TURKISH - PROFANITY / INSULTS
    // ============================================================
    "amcik",
    "amcık",
    "amına",
    "amina",
    "aminakoyim",
    "amınakoyim",
    "amina koyim",
    "amına koyim",
    "aminakoyayim",
    "amınakoyayım",
    "aminakoyayım",
    "amk",
    "aq",
    "a.q",
    "a.q.",
    "amq",
    "mk",

    "orospu",
    "orospucocugu",
    "orospuçocuğu",
    "orospuçocu",
    "orospu cocugu",
    "orospu çocuğu",
    "orospuevladi",
    "orospu evladı",
    "orospuevladı",

    "sik",
    "sikerim",
    "sikeyim",
    "sikiyim",
    "siktir",
    "siktirgit",
    "siktir git",
    "siktiret",
    "siktir et",
    "sikik",
    "sikici",
    "sikici",
    "sikilmiş",
    "sikilmis",
    "sikicem",
    "sikecem",
    "sikecegim",
    "sikeceğim",
    "sikiyim",
    "sikim",
    "sikimde",
    "sikimdeğil",
    "sikimde degil",

    "yarrak",
    "yarak",
    "yarram",
    "yarrağım",
    "yarragim",
    "yarramin",
    "yarrağımın",

    "got",
    "göt",
    "gotveren",
    "götveren",
    "gotlek",
    "götlek",
    "gotunu",
    "götünü",
    "gotune",
    "götüne",

    "pezevenk",
    "pezevenkler",
    "piç",
    "pic",
    "piclik",
    "piçlik",
    "kahpe",
    "kahpeevladi",
    "kahpeevladı",

    "ibne",
    "ibnelik",
    "ibneler",

    "gerizekali",
    "gerizekalı",
    "geri zekali",
    "geri zekalı",
    "salak",
    "aptal",
    "mal",
    "dangalak",
    "hıyar",
    "hiyar",
    "lavuk",
    "dallama",
    "dalyarak",
    "dalyarrak",
    "dingil",
    "andaval",
    "embesil",
    "şerefsiz",
    "serefsiz",
    "şerefsizler",
    "serefsizler",
    "namussuz",
    "adi",
    "itogluit",
    "itoglu",
    "it oğlu",
    "köpek",
    "kopek",
    "yavşak",
    "yavsak",
    "yavşaklar",
    "yavsaklar",

    // ============================================================
    // ENGLISH - PROFANITY
    // ============================================================
    "fuck",
    "fucker",
    "fuckers",
    "fucking",
    "fucked",
    "fuckyou",
    "fuck-you",
    "fuckoff",
    "fuck-off",
    "motherfucker",
    "motherfuckers",
    "motherfucking",
    "motherfckr",
    "motherfkr",
    "mfucker",

    "shit",
    "shitty",
    "shithead",
    "shitface",
    "shitbag",
    "bullshit",
    "horseshit",
    "dipshit",

    "bitch",
    "bitches",
    "bitchass",
    "sonofabitch",

    "cunt",
    "cunts",

    "dick",
    "dickhead",
    "dickface",

    "cock",
    "cocksucker",

    "pussy",
    "pussies",

    "asshole",
    "assholes",
    "arsehole",
    "arseholes",
    "jackass",
    "dumbass",
    "badass",

    "bastard",
    "bastards",

    "wanker",
    "twat",
    "prick",
    "bellend",
    "douche",
    "douchebag",
    "jerkoff",

    // ============================================================
    // SEXUAL / ADULT
    // ============================================================
    "porn",
    "porno",
    "pornography",
    "pornographic",
    "pornstar",
    "pornstars",
    "pornhub",
    "pornhubpremium",

    "xnxx",
    "xvideos",
    "redtube",
    "youporn",
    "tube8",
    "brazzers",
    "bangbros",
    "realitykings",
    "teamskeet",
    "naughtyamerica",

    "onlyfans",
    "onlyfan",
    "fansly",
    "manyvids",

    "hentai",
    "rule34",
    "r34",
    "nhentai",
    "hanime",

    "xxx",
    "xxxx",
    "sex",
    "sexcam",
    "sexcams",
    "sexchat",
    "sexvideo",
    "sexvideos",
    "sexshop",

    "nsfw",
    "nudes",
    "nude",
    "naked",
    "nudity",

    "blowjob",
    "blowjobs",
    "handjob",
    "handjobs",
    "rimjob",

    "gangbang",
    "orgy",
    "orgies",
    "anal",
    "analporn",
    "deepthroat",

    "milf",
    "gilf",

    "cum",
    "cumshot",
    "cumshots",
    "creampie",
    "creampies",

    "masturbate",
    "masturbation",

    "escort",
    "escorts",
    "hooker",
    "prostitute",
    "prostitution",

    // ============================================================
    // EXTREMISM / NAZI SYMBOLISM
    // ============================================================
    "nazi",
    "nazis",
    "nazism",
    "neonazi",
    "neo-nazi",
    "hitler",
    "heilhitler",
    "heil-hitler",
    "siegheil",
    "sieg-heil",
    "ss",
    "waffenss",
    "waffen-ss",
    "aryan",
    "aryanrace",
    "whitepower",
    "white-power",
    "whitepride",
    "white-pride",
    "whitesupremacy",
    "whitesupremacist",
    "1488",
    "88hh",

    // ============================================================
    // RACIAL / ETHNIC SLURS
    //
    // Keep these exclusively as moderation terms.
    // ============================================================
    "nigger",
    "niggers",
    "nigga",
    "niggas",
    "negro",
    "coon",
    "coons",
    "darkie",
    "darkies",
    "kike",
    "kikes",
    "chink",
    "chinks",
    "gook",
    "gooks",
    "spic",
    "spics",
    "wetback",
    "wetbacks",
    "raghead",
    "ragheads",
    "sandnigger",
    "paki",
    "pakis",
    "gypsy",
    "gypsies",
    "towelhead",

    // ============================================================
    // HOMOPHOBIC / TRANSPHOBIC SLURS
    // ============================================================
    "faggot",
    "faggots",
    "fag",
    "fags",
    "tranny",
    "trannies",

    // ============================================================
    // GERMAN
    // ============================================================
    "scheisse",
    "scheiße",
    "arschloch",
    "arsch",
    "hurensohn",
    "hure",
    "wichser",
    "fotze",
    "schlampe",
    "schwanz",
    "missgeburt",
    "drecksau",

    // ============================================================
    // FRENCH
    // ============================================================
    "putain",
    "pute",
    "putes",
    "connard",
    "connards",
    "connasse",
    "merde",
    "encule",
    "enculé",
    "enculer",
    "salope",
    "salopes",
    "bordel",
    "bite",
    "couilles",

    // ============================================================
    // SPANISH
    // ============================================================
    "puta",
    "putas",
    "puto",
    "putos",
    "mierda",
    "cabron",
    "cabrón",
    "cabrones",
    "pendejo",
    "pendejos",
    "gilipollas",
    "coño",
    "cono",
    "joder",
    "chingar",
    "chingada",
    "chingado",
    "culero",
    "maricon",
    "maricón",

    // ============================================================
    // PORTUGUESE / BRAZILIAN PORTUGUESE
    // ============================================================
    "porra",
    "caralho",
    "caralhos",
    "puta",
    "putaria",
    "filhadaputa",
    "filho-da-puta",
    "filhodaputa",
    "merda",
    "cuzao",
    "cuzão",
    "viado",
    "buceta",
    "piroca",

    // ============================================================
    // ITALIAN
    // ============================================================
    "cazzo",
    "cazzi",
    "merda",
    "stronzo",
    "stronza",
    "puttana",
    "troia",
    "vaffanculo",
    "fanculo",
    "coglione",
    "coglioni",

    // ============================================================
    // DUTCH
    // ============================================================
    "kanker",
    "kankerlijer",
    "kut",
    "klootzak",
    "hoer",
    "tering",
    "tyfus",

    // ============================================================
    // POLISH
    // ============================================================
    "kurwa",
    "kurwy",
    "kurwo",
    "pierdol",
    "pierdolony",
    "pierdolona",
    "chuj",
    "chuja",
    "cipa",
    "suka",

    // ============================================================
    // RUSSIAN / TRANSLITERATED
    // ============================================================
    "blyat",
    "bljat",
    "cyka",
    "suka",
    "sukablyat",
    "sukablyat",
    "pidor",
    "pidoras",
    "huy",
    "hui",
    "nahui",
    "nahuy",
    "ebat",
    "yebat",

    // Cyrillic
    "блять",
    "сука",
    "хуй",
    "нахуй",
    "ебать",
    "пизда",

    // ============================================================
    // ARABIC - COMMON PROFANITY
    // ============================================================
    "كس",
    "كسمك",
    "كسامك",
    "شرموط",
    "شرموطة",
    "قحبة",
    "زب",
    "منيك",

    // Transliteration
    "kosomak",
    "kosomk",
    "sharmout",
    "sharmouta",
    "gahba",

    // ============================================================
    // INTERNET / TOXIC / TROLL IDENTITIES
    // ============================================================
    "rape",
    "rapist",
    "rapists",
    "raper",
    "molester",
    "pedo",
    "pedophile",
    "pedophilia",
    "paedophile",
    "paedophilia",
    "childporn",
    "childporno",
    "cporn",

    // ============================================================
    // SCAM / IMPERSONATION / TRUST ABUSE
    // ============================================================
    "officialadmin",
    "official-admin",
    "officialsupport",
    "official-support",
    "officialmoderator",
    "official-mod",
    "supportadmin",
    "support-admin",
    "adminsupport",
    "admin-support",

    "accountsupport",
    "account-support",
    "securitysupport",
    "security-support",

    "verificationteam",
    "verifyaccount",
    "verify-account",
    "verificationbot",

    "freepremium",
    "free-premium",
    "freeverified",
    "free-verified",
    "freeverification",

    "giveawayadmin",
    "giveawaysupport",
    "giveawaybot",

    // ============================================================
    // SCAM / FRAUD WORDING
    // ============================================================
    "scam",
    "scammer",
    "scammers",
    "fraud",
    "fraudster",
    "phishing",
    "phisher",
    "phish",
    "stealer",
    "tokenstealer",
    "passwordstealer",
    "accountstealer",

    // ============================================================
    // MALWARE / ABUSE IDENTITIES
    // ============================================================
    "malware",
    "ransomware",
    "keylogger",
    "rat",
    "botnet",
    "ddos",
    "booter",
    "stresser",

    // ============================================================
    // PLATFORM IMPERSONATION
    // ============================================================
    "discord",
    "discordadmin",
    "discordstaff",
    "discordsupport",
    "discordmoderator",

    "telegram",
    "telegramadmin",
    "telegramsupport",

    "instagram",
    "instagramadmin",
    "instagramsupport",

    "tiktok",
    "tiktokadmin",
    "tiktoksupport",

    "youtube",
    "youtubeadmin",
    "youtubesupport",

    "twitter",
    "xadmin",
    "xsupport",

    "facebook",
    "facebookadmin",
    "facebooksupport",

    // ============================================================
    // FINANCIAL / CRYPTO IMPERSONATION
    // ============================================================
    "paypal",
    "paypalsupport",
    "paypaladmin",

    "stripe",
    "stripesupport",

    "visa",
    "mastercard",

    "binance",
    "binancesupport",

    "coinbase",
    "coinbasesupport",

    // ============================================================
    // GENERIC PRIVILEGED TERMS
    // ============================================================
    "administrator",
    "adminstrator",
    "administrater",
    "adm1n",
    "admın",
    "support",
    "supp0rt",
    "moderator",
    "moderat0r",
    "verified",
    "ver1fied",
    "official",
    "officia1",
  ],
} as const;

export const USERNAME_UNAVAILABLE_MESSAGE =
  "Bu kullanıcı adı kullanılamıyor.";