// app/lib/iconRegistry.ts
// Curated icon registry — Lucide + Tabler.
// We import a popular subset (~140 icons) rather than dynamic-loading all
// 2000+ icons, which would bloat the bundle. Users can request additions
// via a follow-up commit if a needed icon is missing.

import type { LucideIcon } from "lucide-react";
import {
  // Actions
  Plus, Minus, Edit, Trash2, Copy, Check, X, Search, Filter,
  Save, Download, Upload, Share2, Send, Lock, Unlock, RefreshCw,
  RotateCcw, RotateCw, Settings, MoreHorizontal, MoreVertical,
  // Arrows
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, ArrowDownRight,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  CornerUpLeft, CornerDownRight, ArrowUpDown, ArrowLeftRight,
  // UI
  Menu, Grid, List, LayoutGrid, LayoutDashboard, LayoutList, Columns3, Rows3,
  Maximize, Minimize, ExternalLink, Eye, EyeOff, Zap, Sparkles,
  // Files
  File, FileText, FilePlus, Folder, FolderOpen, FolderPlus, Image,
  Paperclip, Link2, Archive,
  // Communication
  Mail, MessageSquare, MessageCircle, Bell, BellOff, Phone, Mic, MicOff,
  // User
  User, Users, UserPlus, UserMinus, UserCheck, LogIn, LogOut,
  // Time
  Clock, Calendar, CalendarDays, Timer, History,
  // Devices
  Monitor, Smartphone, Tablet, Laptop, Tv, Camera, Bluetooth, Wifi, WifiOff,
  // Visual
  Palette, Brush, PenTool, Pencil, Type as TypeIcon, Layers,
  Sun, Moon, Stars,
  // Chart
  BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Activity,
  // Code
  Code2, Terminal, GitBranch, GitMerge, GitPullRequest, Github,
  // Misc
  Heart, Star, Bookmark, Flag, Tag, Trophy, Crown, Shield,
  Home, MapPin, Compass, Globe, Map,
  Hammer, Wrench, Gauge, Bot, Cpu, Database, Server, Cloud,
  AlertTriangle, AlertCircle, CheckCircle, XCircle, HelpCircle, Info,
} from "lucide-react";

import {
  IconHammer, IconBolt, IconRocket, IconShield, IconCrown,
  IconCode, IconBrandGithub, IconBrandGoogle, IconBrandTwitter, IconBrandLinkedin,
  IconBrandDiscord, IconBrandSlack, IconBrandX, IconBrandStripe, IconBrandFigma,
  IconBrandReact, IconBrandNextjs, IconBrandVercel, IconBrandTypescript, IconBrandTailwind,
  IconWand, IconPalette, IconRulerMeasure, IconFlame, IconSparkles,
  IconCircleDashed, IconHexagon, IconTriangle, IconSquare, IconStar,
} from "@tabler/icons-react";

export type IconLibrary = "lucide" | "tabler";

export interface IconEntry {
  name: string;
  library: IconLibrary;
  /** Component reference */
  component: LucideIcon | React.ComponentType<{ size?: number; className?: string; stroke?: number | string; color?: string }>;
  /** Category for filtering */
  category: string;
  /** Search keywords */
  keywords: string[];
}

// Lucide entries — curated subset
const LUCIDE: IconEntry[] = [
  // Actions
  { name: "Plus", library: "lucide", component: Plus, category: "Actions", keywords: ["add", "new", "create"] },
  { name: "Minus", library: "lucide", component: Minus, category: "Actions", keywords: ["subtract", "remove"] },
  { name: "Edit", library: "lucide", component: Edit, category: "Actions", keywords: ["pencil", "modify"] },
  { name: "Trash2", library: "lucide", component: Trash2, category: "Actions", keywords: ["delete", "bin", "remove"] },
  { name: "Copy", library: "lucide", component: Copy, category: "Actions", keywords: ["duplicate", "clipboard"] },
  { name: "Check", library: "lucide", component: Check, category: "Actions", keywords: ["confirm", "yes", "done"] },
  { name: "X", library: "lucide", component: X, category: "Actions", keywords: ["close", "cancel", "no"] },
  { name: "Search", library: "lucide", component: Search, category: "Actions", keywords: ["find", "magnify"] },
  { name: "Filter", library: "lucide", component: Filter, category: "Actions", keywords: ["funnel", "sort"] },
  { name: "Save", library: "lucide", component: Save, category: "Actions", keywords: ["disk", "store"] },
  { name: "Download", library: "lucide", component: Download, category: "Actions", keywords: ["save", "import"] },
  { name: "Upload", library: "lucide", component: Upload, category: "Actions", keywords: ["export", "share"] },
  { name: "Share2", library: "lucide", component: Share2, category: "Actions", keywords: ["send", "social"] },
  { name: "Send", library: "lucide", component: Send, category: "Actions", keywords: ["paper-plane", "submit"] },
  { name: "Lock", library: "lucide", component: Lock, category: "Actions", keywords: ["secure", "private"] },
  { name: "Unlock", library: "lucide", component: Unlock, category: "Actions", keywords: ["open", "release"] },
  { name: "RefreshCw", library: "lucide", component: RefreshCw, category: "Actions", keywords: ["reload", "refresh", "spin"] },
  { name: "RotateCcw", library: "lucide", component: RotateCcw, category: "Actions", keywords: ["undo", "reset"] },
  { name: "RotateCw", library: "lucide", component: RotateCw, category: "Actions", keywords: ["redo"] },
  { name: "Settings", library: "lucide", component: Settings, category: "Actions", keywords: ["gear", "options", "config"] },
  { name: "MoreHorizontal", library: "lucide", component: MoreHorizontal, category: "Actions", keywords: ["dots", "menu"] },
  { name: "MoreVertical", library: "lucide", component: MoreVertical, category: "Actions", keywords: ["dots", "menu"] },
  // Arrows
  { name: "ArrowUp", library: "lucide", component: ArrowUp, category: "Arrows", keywords: ["up", "north"] },
  { name: "ArrowDown", library: "lucide", component: ArrowDown, category: "Arrows", keywords: ["down", "south"] },
  { name: "ArrowLeft", library: "lucide", component: ArrowLeft, category: "Arrows", keywords: ["left", "west", "back"] },
  { name: "ArrowRight", library: "lucide", component: ArrowRight, category: "Arrows", keywords: ["right", "east", "forward"] },
  { name: "ArrowUpRight", library: "lucide", component: ArrowUpRight, category: "Arrows", keywords: ["external", "diagonal"] },
  { name: "ArrowDownRight", library: "lucide", component: ArrowDownRight, category: "Arrows", keywords: ["diagonal"] },
  { name: "ChevronUp", library: "lucide", component: ChevronUp, category: "Arrows", keywords: ["up", "expand"] },
  { name: "ChevronDown", library: "lucide", component: ChevronDown, category: "Arrows", keywords: ["down", "expand"] },
  { name: "ChevronLeft", library: "lucide", component: ChevronLeft, category: "Arrows", keywords: ["left", "previous"] },
  { name: "ChevronRight", library: "lucide", component: ChevronRight, category: "Arrows", keywords: ["right", "next"] },
  { name: "CornerUpLeft", library: "lucide", component: CornerUpLeft, category: "Arrows", keywords: ["return", "back"] },
  { name: "CornerDownRight", library: "lucide", component: CornerDownRight, category: "Arrows", keywords: ["reply"] },
  { name: "ArrowUpDown", library: "lucide", component: ArrowUpDown, category: "Arrows", keywords: ["sort", "swap"] },
  { name: "ArrowLeftRight", library: "lucide", component: ArrowLeftRight, category: "Arrows", keywords: ["swap", "transfer"] },
  // UI
  { name: "Menu", library: "lucide", component: Menu, category: "UI", keywords: ["hamburger", "list", "burger"] },
  { name: "Grid", library: "lucide", component: Grid, category: "UI", keywords: ["layout"] },
  { name: "List", library: "lucide", component: List, category: "UI", keywords: ["bullet"] },
  { name: "LayoutGrid", library: "lucide", component: LayoutGrid, category: "UI", keywords: ["dashboard", "tiles"] },
  { name: "LayoutDashboard", library: "lucide", component: LayoutDashboard, category: "UI", keywords: ["dashboard"] },
  { name: "LayoutList", library: "lucide", component: LayoutList, category: "UI", keywords: ["list-layout"] },
  { name: "Columns3", library: "lucide", component: Columns3, category: "UI", keywords: ["columns"] },
  { name: "Rows3", library: "lucide", component: Rows3, category: "UI", keywords: ["rows"] },
  { name: "Maximize", library: "lucide", component: Maximize, category: "UI", keywords: ["fullscreen", "expand"] },
  { name: "Minimize", library: "lucide", component: Minimize, category: "UI", keywords: ["collapse"] },
  { name: "ExternalLink", library: "lucide", component: ExternalLink, category: "UI", keywords: ["link", "open", "outbound"] },
  { name: "Eye", library: "lucide", component: Eye, category: "UI", keywords: ["view", "show", "visible"] },
  { name: "EyeOff", library: "lucide", component: EyeOff, category: "UI", keywords: ["hide", "invisible"] },
  { name: "Zap", library: "lucide", component: Zap, category: "UI", keywords: ["lightning", "fast", "electric"] },
  { name: "Sparkles", library: "lucide", component: Sparkles, category: "UI", keywords: ["magic", "ai", "shine"] },
  // Files
  { name: "File", library: "lucide", component: File, category: "Files", keywords: ["document"] },
  { name: "FileText", library: "lucide", component: FileText, category: "Files", keywords: ["doc", "page"] },
  { name: "FilePlus", library: "lucide", component: FilePlus, category: "Files", keywords: ["new", "add"] },
  { name: "Folder", library: "lucide", component: Folder, category: "Files", keywords: ["directory"] },
  { name: "FolderOpen", library: "lucide", component: FolderOpen, category: "Files", keywords: ["open"] },
  { name: "FolderPlus", library: "lucide", component: FolderPlus, category: "Files", keywords: ["new"] },
  { name: "Image", library: "lucide", component: Image, category: "Files", keywords: ["picture", "photo"] },
  { name: "Paperclip", library: "lucide", component: Paperclip, category: "Files", keywords: ["attach"] },
  { name: "Link2", library: "lucide", component: Link2, category: "Files", keywords: ["chain", "link"] },
  { name: "Archive", library: "lucide", component: Archive, category: "Files", keywords: ["zip", "store"] },
  // Communication
  { name: "Mail", library: "lucide", component: Mail, category: "Communication", keywords: ["email", "envelope"] },
  { name: "MessageSquare", library: "lucide", component: MessageSquare, category: "Communication", keywords: ["chat", "message"] },
  { name: "MessageCircle", library: "lucide", component: MessageCircle, category: "Communication", keywords: ["chat", "bubble"] },
  { name: "Bell", library: "lucide", component: Bell, category: "Communication", keywords: ["alert", "notification"] },
  { name: "BellOff", library: "lucide", component: BellOff, category: "Communication", keywords: ["mute"] },
  { name: "Phone", library: "lucide", component: Phone, category: "Communication", keywords: ["call"] },
  { name: "Mic", library: "lucide", component: Mic, category: "Communication", keywords: ["microphone", "audio"] },
  { name: "MicOff", library: "lucide", component: MicOff, category: "Communication", keywords: ["mute"] },
  // User
  { name: "User", library: "lucide", component: User, category: "User", keywords: ["person", "profile"] },
  { name: "Users", library: "lucide", component: Users, category: "User", keywords: ["team", "people"] },
  { name: "UserPlus", library: "lucide", component: UserPlus, category: "User", keywords: ["add", "invite"] },
  { name: "UserMinus", library: "lucide", component: UserMinus, category: "User", keywords: ["remove"] },
  { name: "UserCheck", library: "lucide", component: UserCheck, category: "User", keywords: ["verified"] },
  { name: "LogIn", library: "lucide", component: LogIn, category: "User", keywords: ["sign-in", "auth"] },
  { name: "LogOut", library: "lucide", component: LogOut, category: "User", keywords: ["sign-out", "exit"] },
  // Time
  { name: "Clock", library: "lucide", component: Clock, category: "Time", keywords: ["time", "watch"] },
  { name: "Calendar", library: "lucide", component: Calendar, category: "Time", keywords: ["date", "schedule"] },
  { name: "CalendarDays", library: "lucide", component: CalendarDays, category: "Time", keywords: ["date"] },
  { name: "Timer", library: "lucide", component: Timer, category: "Time", keywords: ["stopwatch"] },
  { name: "History", library: "lucide", component: History, category: "Time", keywords: ["recent"] },
  // Devices
  { name: "Monitor", library: "lucide", component: Monitor, category: "Devices", keywords: ["screen", "desktop"] },
  { name: "Smartphone", library: "lucide", component: Smartphone, category: "Devices", keywords: ["phone", "mobile"] },
  { name: "Tablet", library: "lucide", component: Tablet, category: "Devices", keywords: ["ipad"] },
  { name: "Laptop", library: "lucide", component: Laptop, category: "Devices", keywords: ["computer"] },
  { name: "Tv", library: "lucide", component: Tv, category: "Devices", keywords: ["television"] },
  { name: "Camera", library: "lucide", component: Camera, category: "Devices", keywords: ["photo"] },
  { name: "Bluetooth", library: "lucide", component: Bluetooth, category: "Devices", keywords: ["wireless"] },
  { name: "Wifi", library: "lucide", component: Wifi, category: "Devices", keywords: ["wireless", "internet"] },
  { name: "WifiOff", library: "lucide", component: WifiOff, category: "Devices", keywords: ["offline"] },
  // Visual
  { name: "Palette", library: "lucide", component: Palette, category: "Visual", keywords: ["color", "design"] },
  { name: "Brush", library: "lucide", component: Brush, category: "Visual", keywords: ["paint"] },
  { name: "PenTool", library: "lucide", component: PenTool, category: "Visual", keywords: ["draw", "vector"] },
  { name: "Pencil", library: "lucide", component: Pencil, category: "Visual", keywords: ["edit", "draw"] },
  { name: "TypeIcon", library: "lucide", component: TypeIcon, category: "Visual", keywords: ["text", "font", "typography"] },
  { name: "Layers", library: "lucide", component: Layers, category: "Visual", keywords: ["stack", "groups"] },
  { name: "Sun", library: "lucide", component: Sun, category: "Visual", keywords: ["light", "day", "bright"] },
  { name: "Moon", library: "lucide", component: Moon, category: "Visual", keywords: ["dark", "night"] },
  { name: "Stars", library: "lucide", component: Stars, category: "Visual", keywords: ["sparkle", "rating"] },
  // Charts
  { name: "BarChart3", library: "lucide", component: BarChart3, category: "Charts", keywords: ["graph", "stats"] },
  { name: "LineChart", library: "lucide", component: LineChart, category: "Charts", keywords: ["graph", "trend"] },
  { name: "PieChart", library: "lucide", component: PieChart, category: "Charts", keywords: ["donut"] },
  { name: "TrendingUp", library: "lucide", component: TrendingUp, category: "Charts", keywords: ["growth", "rise"] },
  { name: "TrendingDown", library: "lucide", component: TrendingDown, category: "Charts", keywords: ["decline", "fall"] },
  { name: "Activity", library: "lucide", component: Activity, category: "Charts", keywords: ["pulse", "monitor"] },
  // Code
  { name: "Code2", library: "lucide", component: Code2, category: "Code", keywords: ["development", "programming"] },
  { name: "Terminal", library: "lucide", component: Terminal, category: "Code", keywords: ["console", "shell"] },
  { name: "GitBranch", library: "lucide", component: GitBranch, category: "Code", keywords: ["version-control"] },
  { name: "GitMerge", library: "lucide", component: GitMerge, category: "Code", keywords: ["merge"] },
  { name: "GitPullRequest", library: "lucide", component: GitPullRequest, category: "Code", keywords: ["pr", "review"] },
  { name: "Github", library: "lucide", component: Github, category: "Code", keywords: ["repo", "social"] },
  // Misc
  { name: "Heart", library: "lucide", component: Heart, category: "Misc", keywords: ["like", "favorite", "love"] },
  { name: "Star", library: "lucide", component: Star, category: "Misc", keywords: ["favorite", "rating"] },
  { name: "Bookmark", library: "lucide", component: Bookmark, category: "Misc", keywords: ["save"] },
  { name: "Flag", library: "lucide", component: Flag, category: "Misc", keywords: ["report", "marker"] },
  { name: "Tag", library: "lucide", component: Tag, category: "Misc", keywords: ["label"] },
  { name: "Trophy", library: "lucide", component: Trophy, category: "Misc", keywords: ["winner", "achievement"] },
  { name: "Crown", library: "lucide", component: Crown, category: "Misc", keywords: ["king", "premium"] },
  { name: "Shield", library: "lucide", component: Shield, category: "Misc", keywords: ["security", "protect"] },
  { name: "Home", library: "lucide", component: Home, category: "Misc", keywords: ["house"] },
  { name: "MapPin", library: "lucide", component: MapPin, category: "Misc", keywords: ["location", "marker"] },
  { name: "Compass", library: "lucide", component: Compass, category: "Misc", keywords: ["navigate"] },
  { name: "Globe", library: "lucide", component: Globe, category: "Misc", keywords: ["world", "earth"] },
  { name: "Map", library: "lucide", component: Map, category: "Misc", keywords: ["geography"] },
  { name: "Hammer", library: "lucide", component: Hammer, category: "Misc", keywords: ["tool", "build", "mjolnir"] },
  { name: "Wrench", library: "lucide", component: Wrench, category: "Misc", keywords: ["tool", "fix"] },
  { name: "Gauge", library: "lucide", component: Gauge, category: "Misc", keywords: ["meter", "speedometer"] },
  { name: "Bot", library: "lucide", component: Bot, category: "Misc", keywords: ["ai", "robot"] },
  { name: "Cpu", library: "lucide", component: Cpu, category: "Misc", keywords: ["chip", "processor"] },
  { name: "Database", library: "lucide", component: Database, category: "Misc", keywords: ["storage", "db"] },
  { name: "Server", library: "lucide", component: Server, category: "Misc", keywords: ["computer"] },
  { name: "Cloud", library: "lucide", component: Cloud, category: "Misc", keywords: ["weather", "saas"] },
  { name: "AlertTriangle", library: "lucide", component: AlertTriangle, category: "Status", keywords: ["warning", "danger"] },
  { name: "AlertCircle", library: "lucide", component: AlertCircle, category: "Status", keywords: ["alert", "warning"] },
  { name: "CheckCircle", library: "lucide", component: CheckCircle, category: "Status", keywords: ["success", "verified"] },
  { name: "XCircle", library: "lucide", component: XCircle, category: "Status", keywords: ["error", "fail"] },
  { name: "HelpCircle", library: "lucide", component: HelpCircle, category: "Status", keywords: ["question", "help"] },
  { name: "Info", library: "lucide", component: Info, category: "Status", keywords: ["information", "tooltip"] },
];

const TABLER: IconEntry[] = [
  { name: "IconHammer", library: "tabler", component: IconHammer, category: "Misc", keywords: ["tool", "mjolnir"] },
  { name: "IconBolt", library: "tabler", component: IconBolt, category: "UI", keywords: ["lightning", "electric"] },
  { name: "IconRocket", library: "tabler", component: IconRocket, category: "Misc", keywords: ["launch", "ship"] },
  { name: "IconShield", library: "tabler", component: IconShield, category: "Misc", keywords: ["security"] },
  { name: "IconCrown", library: "tabler", component: IconCrown, category: "Misc", keywords: ["premium", "king"] },
  { name: "IconCode", library: "tabler", component: IconCode, category: "Code", keywords: ["development"] },
  { name: "IconWand", library: "tabler", component: IconWand, category: "Visual", keywords: ["magic", "ai"] },
  { name: "IconPalette", library: "tabler", component: IconPalette, category: "Visual", keywords: ["color", "design"] },
  { name: "IconRulerMeasure", library: "tabler", component: IconRulerMeasure, category: "Visual", keywords: ["measure", "scale"] },
  { name: "IconFlame", library: "tabler", component: IconFlame, category: "Visual", keywords: ["fire", "hot"] },
  { name: "IconSparkles", library: "tabler", component: IconSparkles, category: "Visual", keywords: ["magic", "shine"] },
  { name: "IconCircleDashed", library: "tabler", component: IconCircleDashed, category: "Shapes", keywords: ["circle", "outline"] },
  { name: "IconHexagon", library: "tabler", component: IconHexagon, category: "Shapes", keywords: ["polygon", "6-sides"] },
  { name: "IconTriangle", library: "tabler", component: IconTriangle, category: "Shapes", keywords: ["3-sides"] },
  { name: "IconSquare", library: "tabler", component: IconSquare, category: "Shapes", keywords: ["box", "rectangle"] },
  { name: "IconStar", library: "tabler", component: IconStar, category: "Shapes", keywords: ["favorite", "rating"] },
  // Brands (Tabler has the brand library)
  { name: "IconBrandGithub", library: "tabler", component: IconBrandGithub, category: "Brands", keywords: ["github", "git"] },
  { name: "IconBrandGoogle", library: "tabler", component: IconBrandGoogle, category: "Brands", keywords: ["google"] },
  { name: "IconBrandTwitter", library: "tabler", component: IconBrandTwitter, category: "Brands", keywords: ["twitter"] },
  { name: "IconBrandX", library: "tabler", component: IconBrandX, category: "Brands", keywords: ["x", "twitter"] },
  { name: "IconBrandLinkedin", library: "tabler", component: IconBrandLinkedin, category: "Brands", keywords: ["linkedin"] },
  { name: "IconBrandDiscord", library: "tabler", component: IconBrandDiscord, category: "Brands", keywords: ["discord"] },
  { name: "IconBrandSlack", library: "tabler", component: IconBrandSlack, category: "Brands", keywords: ["slack"] },
  { name: "IconBrandStripe", library: "tabler", component: IconBrandStripe, category: "Brands", keywords: ["stripe", "payment"] },
  { name: "IconBrandFigma", library: "tabler", component: IconBrandFigma, category: "Brands", keywords: ["figma", "design"] },
  { name: "IconBrandReact", library: "tabler", component: IconBrandReact, category: "Brands", keywords: ["react"] },
  { name: "IconBrandNextjs", library: "tabler", component: IconBrandNextjs, category: "Brands", keywords: ["nextjs"] },
  { name: "IconBrandVercel", library: "tabler", component: IconBrandVercel, category: "Brands", keywords: ["vercel"] },
  { name: "IconBrandTypescript", library: "tabler", component: IconBrandTypescript, category: "Brands", keywords: ["typescript"] },
  { name: "IconBrandTailwind", library: "tabler", component: IconBrandTailwind, category: "Brands", keywords: ["tailwind"] },
];

export const ICON_REGISTRY: IconEntry[] = [...LUCIDE, ...TABLER];

export function getIconCategories(): string[] {
  const set = new Set<string>();
  ICON_REGISTRY.forEach((i) => set.add(i.category));
  return Array.from(set).sort();
}

export function searchIcons(
  query: string,
  filter?: { library?: IconLibrary; category?: string }
): IconEntry[] {
  const q = query.trim().toLowerCase();
  return ICON_REGISTRY.filter((icon) => {
    if (filter?.library && icon.library !== filter.library) return false;
    if (filter?.category && icon.category !== filter.category) return false;
    if (!q) return true;
    if (icon.name.toLowerCase().includes(q)) return true;
    if (icon.keywords.some((k) => k.includes(q))) return true;
    if (icon.category.toLowerCase().includes(q)) return true;
    return false;
  });
}

/** Get the canonical import statement for a registry entry */
export function getImportStatement(icon: IconEntry): string {
  const pkg = icon.library === "lucide" ? "lucide-react" : "@tabler/icons-react";
  return `import { ${icon.name} } from "${pkg}";`;
}

/** Get a JSX usage snippet */
export function getJsxSnippet(icon: IconEntry, size = 24): string {
  return `<${icon.name} size={${size}} />`;
}
