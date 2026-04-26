// Asgardian Shader Lab — Phase 1 React-Bits parity
// Left panel: preset grid, uniform sliders, color pickers, toggles
// Right area: full canvas shader preview + GLSL viewer pane
// Tier mix: free (perlin-noise, electric-field), pro (bifrost-tunnel, aurora-borealis), elite (fractal-flame, valhalla-gate, cosmic-web)
"use client";
import React, { useState, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  RotateCcw, Code2, Image as ImageIcon, Play, Pause,
  Copy, Check, ChevronDown, Lock, Sparkles, Plus, X,
} from "lucide-react";
import { hasAccess, getTierConfig, type TierName } from "@/lib/tierConfig";
import { UpgradeModal } from "@/components/Dashboards/UpgradeModal";

/* ── Shader registry ─────────────────────────────────── */
type ShaderDef = {
  id: string;
  label: string;
  tier: TierName;
  description: string;
  defaultColors: string[];
  supportsBloom: boolean;
  supportsGrain: boolean;
  glsl: string;
};

const SHADER_TYPES: ReadonlyArray<ShaderDef> = [
  {
    id: "perlin-noise",
    label: "Perlin Noise",
    tier: "free",
    description: "Classic procedural noise field with smooth turbulence",
    defaultColors: ["#6366f1", "#ec4899", "#10b981"],
    supportsBloom: false,
    supportsGrain: true,
    glsl: `// Perlin Noise — free shader
uniform float iTime;
uniform vec2  iResolution;
uniform float u_speed;
uniform float u_turbulence;
uniform float u_brightness;
uniform vec3  u_color1;
uniform vec3  u_color2;
uniform vec3  u_color3;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
    u.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float t = iTime * u_speed;
  float n = 0.0;
  float amp = 1.0;
  vec2 p = uv * 3.0;
  for (int i = 0; i < 5; i++) {
    n += noise(p + t) * amp;
    p *= 2.0;
    amp *= u_turbulence;
  }
  vec3 col = mix(u_color1, u_color2, n);
  col = mix(col, u_color3, n * n);
  gl_FragColor = vec4(col * u_brightness, 1.0);
}`,
  },
  {
    id: "electric-field",
    label: "Electric Field",
    tier: "free",
    description: "Crackling electric arcs with cyan and gold glow",
    defaultColors: ["#00f0ff", "#FFCC11", "#ffffff"],
    supportsBloom: true,
    supportsGrain: false,
    glsl: `// Electric Field — free shader
uniform float iTime;
uniform vec2  iResolution;
uniform float u_speed;
uniform float u_turbulence;
uniform float u_brightness;
uniform vec3  u_color1;
uniform vec3  u_color2;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
  float t = iTime * u_speed;
  float v = 0.0;
  for (float i = 1.0; i < 6.0; i++) {
    v += sin(uv.x * i * 2.0 + t + sin(uv.y * i + t) * u_turbulence) / i;
  }
  float arc = smoothstep(0.0, 0.2, abs(v));
  vec3 col = mix(u_color1, u_color2, arc);
  col += pow(1.0 - arc, 8.0) * u_color2 * 2.0;
  gl_FragColor = vec4(col * u_brightness, 1.0);
}`,
  },
  {
    id: "bifrost-tunnel",
    label: "Bifrost Tunnel",
    tier: "pro",
    description: "Rainbow fractal tunnel with infinite depth illusion",
    defaultColors: ["#FFCC11", "#00f0ff", "#ec4899"],
    supportsBloom: true,
    supportsGrain: true,
    glsl: `// Bifrost Tunnel — pro shader
uniform float iTime;
uniform vec2  iResolution;
uniform float u_speed;
uniform float u_turbulence;
uniform float u_depth;
uniform float u_brightness;
uniform float u_colorShift;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
  float a = atan(uv.y, uv.x);
  float r = length(uv);
  float z = 1.0 / (r + 0.0001);
  float t = iTime * u_speed;
  float pattern = sin(z * u_depth * 6.0 - t) * 0.5 + 0.5;
  pattern *= sin(a * 8.0 + z + t) * 0.5 + 0.5;
  float hue = fract(z * 0.1 + u_colorShift + t * 0.1);
  vec3 col = 0.5 + 0.5 * cos(6.2831 * (hue + vec3(0.0, 0.33, 0.67)));
  col *= pattern * u_turbulence * 2.0;
  col *= smoothstep(0.0, 0.1, r);
  gl_FragColor = vec4(col * u_brightness, 1.0);
}`,
  },
  {
    id: "aurora-borealis",
    label: "Aurora Borealis",
    tier: "pro",
    description: "Northern lights with layered wave distortion",
    defaultColors: ["#00f0ff", "#6366f1", "#10b981"],
    supportsBloom: true,
    supportsGrain: false,
    glsl: `// Aurora Borealis — pro shader
uniform float iTime;
uniform vec2  iResolution;
uniform float u_speed;
uniform float u_turbulence;
uniform float u_brightness;
uniform vec3  u_color1;
uniform vec3  u_color2;
uniform vec3  u_color3;

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float t = iTime * u_speed;
  float band1 = smoothstep(0.2, 0.5, uv.y + sin(uv.x * 4.0 + t) * 0.1 * u_turbulence);
  float band2 = smoothstep(0.3, 0.6, uv.y + sin(uv.x * 6.0 + t * 1.3) * 0.08 * u_turbulence);
  float band3 = smoothstep(0.4, 0.7, uv.y + sin(uv.x * 8.0 + t * 0.7) * 0.12 * u_turbulence);
  vec3 col = u_color1 * band1 + u_color2 * band2 + u_color3 * band3;
  col *= 1.0 - smoothstep(0.7, 1.0, uv.y);
  gl_FragColor = vec4(col * u_brightness, 1.0);
}`,
  },
  {
    id: "fractal-flame",
    label: "Fractal Flame",
    tier: "elite",
    description: "Recursive flame fractal with iterated function systems",
    defaultColors: ["#f97316", "#FFCC11", "#ec4899"],
    supportsBloom: true,
    supportsGrain: true,
    glsl: `// Fractal Flame — elite shader
uniform float iTime;
uniform vec2  iResolution;
uniform float u_speed;
uniform float u_turbulence;
uniform float u_brightness;
uniform vec3  u_color1;
uniform vec3  u_color2;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
  float t = iTime * u_speed;
  vec2 p = uv;
  float f = 0.0;
  for (int i = 0; i < 8; i++) {
    p = abs(p) / dot(p, p) - u_turbulence;
    f += length(p) * 0.1;
  }
  vec3 col = mix(u_color1, u_color2, sin(f + t) * 0.5 + 0.5);
  gl_FragColor = vec4(col * u_brightness, 1.0);
}`,
  },
  {
    id: "valhalla-gate",
    label: "Valhalla Gate",
    tier: "elite",
    description: "Golden portal with ethereal mist and rune glow",
    defaultColors: ["#FFCC11", "#B87333", "#00f0ff"],
    supportsBloom: true,
    supportsGrain: true,
    glsl: `// Valhalla Gate — elite shader
uniform float iTime;
uniform vec2  iResolution;
uniform float u_speed;
uniform float u_depth;
uniform float u_brightness;
uniform vec3  u_color1;
uniform vec3  u_color2;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
  float t = iTime * u_speed;
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float gate = smoothstep(0.4, 0.0, abs(r - 0.5 - sin(a * 8.0 + t) * 0.05 * u_depth));
  float beam = pow(max(0.0, 1.0 - abs(uv.x * 3.0)), 4.0) * smoothstep(1.0, -0.5, uv.y);
  vec3 col = u_color1 * gate + u_color2 * beam;
  gl_FragColor = vec4(col * u_brightness, 1.0);
}`,
  },
  {
    id: "cosmic-web",
    label: "Cosmic Web",
    tier: "elite",
    description: "Large-scale structure of the universe visualized",
    defaultColors: ["#6366f1", "#00f0ff", "#FFCC11"],
    supportsBloom: true,
    supportsGrain: true,
    glsl: `// Cosmic Web — elite shader
uniform float iTime;
uniform vec2  iResolution;
uniform float u_speed;
uniform float u_turbulence;
uniform float u_brightness;
uniform vec3  u_color1;
uniform vec3  u_color2;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float t = iTime * u_speed;
  vec2 g = fract(uv * 10.0) - 0.5;
  vec2 id = floor(uv * 10.0);
  float d = 1.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 off = vec2(float(x), float(y));
      vec2 p = off + vec2(hash(id + off), hash(id + off + 13.7)) - 0.5;
      p += 0.3 * sin(t + hash(id + off) * 6.28) * u_turbulence;
      d = min(d, length(g - p));
    }
  }
  float web = smoothstep(0.1, 0.0, d);
  vec3 col = mix(u_color1, u_color2, web);
  gl_FragColor = vec4(col * u_brightness, 1.0);
}`,
  },
];

type ShaderTypeId = typeof SHADER_TYPES[number]["id"];

/* ── Reusable slider ─────────────────────────────────── */
function Slider({ label, value, min = 0, max = 1, step = 0.01, onChange }: {
  label: string; value: number; min?: number; max?: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm font-mono text-gray-400">{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#FFCC11]
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FFCC11]"
      />
    </div>
  );
}

/* ── Toggle ──────────────────────────────────────────── */
function Toggle({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative ${checked ? "bg-[#FFCC11]" : "bg-zinc-700"}`}
        aria-pressed={checked}
        aria-label={label}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

/* ── Color picker (shared w/ background-studio) ─────── */
function ColorPicker({ colors, onChange, max = 3 }: {
  colors: string[]; onChange: (colors: string[]) => void; max?: number;
}) {
  const removeColor = (index: number) => onChange(colors.filter((_, i) => i !== index));
  const addColor = () => {
    const defaults = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#00f0ff", "#FFCC11"];
    onChange([...colors, defaults[colors.length % defaults.length]]);
  };

  return (
    <div className="space-y-2">
      <span className="text-sm text-gray-300">Colors</span>
      <div className="flex items-center gap-2 flex-wrap">
        {colors.map((color, i) => (
          <div key={i} className="relative group">
            <input
              type="color" value={color}
              onChange={(e) => { const next = [...colors]; next[i] = e.target.value; onChange(next); }}
              className="w-10 h-10 rounded-lg border-2 border-zinc-700 cursor-pointer bg-transparent appearance-none
                [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
              aria-label={`Color ${i + 1}`}
            />
            {colors.length > 1 && (
              <button
                onClick={() => removeColor(i)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-600
                  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove color ${i + 1}`}
              >
                <X size={8} className="text-gray-400" />
              </button>
            )}
          </div>
        ))}
        {colors.length < max && (
          <button
            onClick={addColor}
            className="w-10 h-10 rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center
              text-gray-500 hover:text-white hover:border-zinc-500 transition-colors"
            aria-label="Add color"
          >
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── GLSL tokenizer (tiny, keyword-based) ────────────── */
const GLSL_KEYWORDS = new Set([
  "void", "float", "int", "bool", "vec2", "vec3", "vec4", "mat2", "mat3", "mat4",
  "uniform", "varying", "attribute", "const", "in", "out", "inout",
  "if", "else", "for", "while", "do", "break", "continue", "return", "discard",
]);
const GLSL_BUILTINS = new Set([
  "sin", "cos", "tan", "asin", "acos", "atan", "pow", "exp", "log", "sqrt",
  "abs", "sign", "floor", "ceil", "fract", "mod", "min", "max", "clamp", "mix",
  "step", "smoothstep", "length", "distance", "dot", "cross", "normalize",
  "reflect", "refract", "gl_FragColor", "gl_FragCoord", "gl_Position",
  "iTime", "iResolution",
]);

type Token = { text: string; cls: string };

function tokenizeGlsl(src: string): Token[] {
  const out: Token[] = [];
  // Split preserving delimiters
  const re = /(\/\/.*$|\/\*[\s\S]*?\*\/|"[^"]*"|\b\d+\.?\d*\b|\b[A-Za-z_][A-Za-z0-9_]*\b|\s+|[^\w\s])/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const t = m[0];
    if (!t) continue;
    if (t.startsWith("//") || t.startsWith("/*")) out.push({ text: t, cls: "text-gray-500 italic" });
    else if (/^\s+$/.test(t)) out.push({ text: t, cls: "" });
    else if (/^\d/.test(t)) out.push({ text: t, cls: "text-amber-300" });
    else if (GLSL_KEYWORDS.has(t)) out.push({ text: t, cls: "text-[#FFCC11] font-semibold" });
    else if (GLSL_BUILTINS.has(t)) out.push({ text: t, cls: "text-[#00f0ff]" });
    else if (/^[A-Za-z_]/.test(t)) out.push({ text: t, cls: "text-gray-200" });
    else out.push({ text: t, cls: "text-gray-400" });
  }
  return out;
}

function HighlightedGlsl({ code }: { code: string }) {
  const tokens = useMemo(() => tokenizeGlsl(code), [code]);
  return (
    <pre className="text-xs font-mono leading-relaxed whitespace-pre overflow-x-auto m-0 p-4">
      <code>
        {tokens.map((tok, i) => (
          <span key={i} className={tok.cls}>{tok.text}</span>
        ))}
      </code>
    </pre>
  );
}

/* ── Shader canvas preview (pattern-based placeholder) ─ */
type Uniforms = {
  speed: number; turbulence: number; depth: number;
  brightness: number; colorShift: number;
  bloom: boolean; grain: boolean;
};

function ShaderCanvas({
  type, uniforms, colors, playing, canvasRef,
}: {
  type: ShaderTypeId;
  uniforms: Uniforms;
  colors: string[];
  playing: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  const hue1 = uniforms.colorShift * 360;
  const hue2 = hue1 + 120;
  const blur = 60 + uniforms.turbulence * 80;
  const c0 = colors[0] || "#6366f1";
  const c1 = colors[1] || "#ec4899";
  const c2 = colors[2] || "#10b981";

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020617]">
      {/* Hidden canvas for PNG export (captures the visible DOM via html2 fallback — we snapshot via a colored canvas) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0 }}
        aria-hidden="true"
      />

      {/* Animated placeholder based on uniforms + color palette */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: `radial-gradient(ellipse at ${30 + uniforms.depth * 40}% ${40 + uniforms.speed * 20}%,
            ${c0} 0%,
            ${c1} 40%,
            #020617 80%)`,
          filter: `blur(${blur}px) brightness(${uniforms.brightness}) hue-rotate(${hue1}deg)`,
          animationPlayState: playing ? "running" : "paused",
        }}
      />
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: `radial-gradient(ellipse at ${70 - uniforms.depth * 30}% ${60 - uniforms.speed * 20}%,
            ${c2} 0%,
            transparent 50%)`,
          filter: `blur(${blur * 0.8}px) hue-rotate(${hue2}deg)`,
          opacity: 0.6,
          mixBlendMode: "screen",
        }}
      />

      {/* Grain overlay */}
      {uniforms.grain && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
          }}
        />
      )}

      {/* Bloom vignette highlight */}
      {uniforms.bloom && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)`,
            mixBlendMode: "multiply",
          }}
        />
      )}
    </div>
  );
}

/* ── Preset card ─────────────────────────────────────── */
function PresetCard({
  shader, isActive, locked, onClick,
}: {
  shader: ShaderDef;
  isActive: boolean;
  locked: boolean;
  onClick: () => void;
}) {
  const tierCfg = getTierConfig(shader.tier);
  const [c0, c1, c2] = shader.defaultColors;

  return (
    <button
      onClick={onClick}
      className={`group relative rounded-xl overflow-hidden border transition-all
        ${isActive
          ? "border-[#FFCC11] ring-2 ring-[#FFCC11]/40"
          : "border-white/10 hover:border-white/30"}
      `}
      style={{
        boxShadow: isActive
          ? `0 0 24px ${tierCfg.color}60`
          : undefined,
      }}
      aria-label={`Select ${shader.label}${locked ? " (locked)" : ""}`}
      aria-pressed={isActive}
    >
      {/* Mini gradient thumbnail */}
      <div
        className="aspect-video w-full relative"
        style={{
          background: `
            radial-gradient(60% 60% at 30% 30%, ${c0} 0%, transparent 70%),
            radial-gradient(60% 60% at 70% 20%, ${c1} 0%, transparent 70%),
            radial-gradient(60% 60% at 50% 80%, ${c2 || c0} 0%, transparent 70%),
            #020617
          `,
          filter: "blur(4px) saturate(1.3)",
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold text-white text-left leading-tight">
            {shader.label}
          </span>
          {locked ? (
            <span
              className="flex items-center gap-1 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full border shrink-0"
              style={{ borderColor: `${tierCfg.color}60`, color: tierCfg.color, backgroundColor: `${tierCfg.color}10` }}
            >
              <Lock size={8} />
              {shader.tier}
            </span>
          ) : (
            <span
              className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: `${tierCfg.color}20`, color: tierCfg.color }}
            >
              {shader.tier}
            </span>
          )}
        </div>
      </div>

      {/* Glow on hover for unlocked */}
      {!locked && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            boxShadow: `inset 0 0 40px ${tierCfg.color}40`,
          }}
        />
      )}
    </button>
  );
}

/* ── React snippet builder ───────────────────────────── */
function buildReactSnippet(shader: ShaderDef, uniforms: Uniforms, colors: string[]) {
  return `// MjolnirUI Shader: ${shader.label}
// Install: npx mjolnirui add shader-${shader.id}
import { ShaderCanvas } from "@mjolnirui/shaders";

export function ${shader.id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/^./, s => s.toUpperCase())}Background() {
  return (
    <ShaderCanvas
      preset="${shader.id}"
      speed={${uniforms.speed.toFixed(2)}}
      turbulence={${uniforms.turbulence.toFixed(2)}}
      depth={${uniforms.depth.toFixed(2)}}
      brightness={${uniforms.brightness.toFixed(2)}}
      colorShift={${uniforms.colorShift.toFixed(2)}}
      bloom={${uniforms.bloom}}
      grain={${uniforms.grain}}
      colors={${JSON.stringify(colors)}}
    />
  );
}
`;
}

/* ── Main page ───────────────────────────────────────── */
export default function ShaderLabPage() {
  const { data: session } = useSession();
  const userTier = (session?.user?.tier as TierName) || "free";

  const [shaderId, setShaderId] = useState<ShaderTypeId>("perlin-noise");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeTier, setUpgradeTier] = useState<TierName>("pro");
  const [playing, setPlaying] = useState(true);
  const [glslOpen, setGlslOpen] = useState(true);
  const [copiedGlsl, setCopiedGlsl] = useState(false);
  const [copiedReact, setCopiedReact] = useState(false);

  const shader = useMemo(
    () => SHADER_TYPES.find(s => s.id === shaderId) ?? SHADER_TYPES[0],
    [shaderId],
  );

  const [uniforms, setUniforms] = useState<Uniforms>({
    speed: 0.30,
    turbulence: 0.50,
    depth: 0.60,
    brightness: 1.20,
    colorShift: 0.00,
    bloom: false,
    grain: false,
  });

  const [colors, setColors] = useState<string[]>(shader.defaultColors);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Page-level paywall: shader lab itself is free-accessible (free shaders are gateway)
  // No redirect — free users see free presets, locked ones trigger UpgradeModal.

  const updateUniform = <K extends keyof Uniforms>(key: K, value: Uniforms[K]) => {
    setUniforms(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setUniforms({
      speed: 0.30, turbulence: 0.50, depth: 0.60,
      brightness: 1.20, colorShift: 0.00,
      bloom: false, grain: false,
    });
    setColors(shader.defaultColors);
    setPlaying(true);
  };

  const handleSelectShader = (id: ShaderTypeId, tier: TierName) => {
    if (!hasAccess(userTier, tier)) {
      setUpgradeTier(tier);
      setShowUpgrade(true);
      return;
    }
    const next = SHADER_TYPES.find(s => s.id === id);
    if (next) {
      setShaderId(id);
      setColors(next.defaultColors);
    }
  };

  const handleCopyGlsl = async () => {
    try {
      await navigator.clipboard.writeText(shader.glsl);
      setCopiedGlsl(true);
      setTimeout(() => setCopiedGlsl(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleCopyReact = async () => {
    try {
      await navigator.clipboard.writeText(buildReactSnippet(shader, uniforms, colors));
      setCopiedReact(true);
      setTimeout(() => setCopiedReact(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleDownloadPng = () => {
    // Paint a snapshot of the current color palette into the offscreen canvas and export.
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    const w = cvs.width = 1600;
    const h = cvs.height = 900;

    // Base fill
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, w, h);

    // Radial gradients from palette
    colors.forEach((col, i) => {
      const cx = w * (0.2 + (i * 0.3) % 0.8);
      const cy = h * (0.3 + (i * 0.25) % 0.7);
      const rad = Math.min(w, h) * (0.4 + uniforms.depth * 0.4);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      grad.addColorStop(0, col);
      grad.addColorStop(1, "transparent");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    });
    ctx.globalCompositeOperation = "source-over";

    const url = cvs.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `mjolnirui-${shader.id}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const selectedTierConfig = getTierConfig(shader.tier);

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden">
      {/* ── Left Panel: Controls ─────────────────────── */}
      <div
        className="w-96 shrink-0 flex flex-col bg-zinc-950 border-r border-zinc-800/50 overflow-y-auto scrollbar-thin"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/50">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${selectedTierConfig.color}20` }}
            >
              <Sparkles size={16} style={{ color: selectedTierConfig.color }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Shader Lab</h2>
              <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: selectedTierConfig.color }}>
                {shader.label} · {shader.tier}
              </p>
            </div>
          </div>
        </div>

        {/* Preset thumbnail grid */}
        <div className="p-5 border-b border-zinc-800/50">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Presets</div>
          <div className="grid grid-cols-2 gap-2">
            {SHADER_TYPES.map((s) => {
              const locked = !hasAccess(userTier, s.tier);
              return (
                <PresetCard
                  key={s.id}
                  shader={s}
                  isActive={s.id === shaderId}
                  locked={locked}
                  onClick={() => handleSelectShader(s.id, s.tier)}
                />
              );
            })}
          </div>
        </div>

        {/* Uniform sliders */}
        <div className="p-5 space-y-5 border-b border-zinc-800/50">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Uniforms</div>
          <Slider label="Speed" value={uniforms.speed} min={0} max={2} step={0.01} onChange={(v) => updateUniform("speed", v)} />
          <Slider label="Turbulence" value={uniforms.turbulence} min={0} max={1} step={0.01} onChange={(v) => updateUniform("turbulence", v)} />
          <Slider label="Depth" value={uniforms.depth} min={0} max={1} step={0.01} onChange={(v) => updateUniform("depth", v)} />
          <Slider label="Brightness" value={uniforms.brightness} min={0.5} max={2} step={0.01} onChange={(v) => updateUniform("brightness", v)} />
          <Slider label="Color Shift" value={uniforms.colorShift} min={0} max={1} step={0.01} onChange={(v) => updateUniform("colorShift", v)} />
        </div>

        {/* Post-process toggles */}
        {(shader.supportsBloom || shader.supportsGrain) && (
          <div className="p-5 space-y-3 border-b border-zinc-800/50">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Post-process</div>
            {shader.supportsBloom && (
              <Toggle label="Bloom" checked={uniforms.bloom} onChange={(v) => updateUniform("bloom", v)} />
            )}
            {shader.supportsGrain && (
              <Toggle label="Film Grain" checked={uniforms.grain} onChange={(v) => updateUniform("grain", v)} />
            )}
          </div>
        )}

        {/* Color pickers */}
        <div className="p-5 border-b border-zinc-800/50">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Palette</div>
          <ColorPicker colors={colors} onChange={setColors} max={3} />
        </div>

        {/* Playback */}
        <div className="p-5 border-b border-zinc-800/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Playback</span>
            <button
              onClick={() => setPlaying(!playing)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                playing
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={12} /> : <Play size={12} />}
              {playing ? "Pause" : "Play"}
            </button>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="p-5 space-y-3 mt-auto shrink-0">
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={handleDownloadPng}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ImageIcon size={14} />
              PNG
            </button>
          </div>
          <button
            onClick={handleCopyReact}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {copiedReact ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copiedReact ? "Copied React snippet" : "Copy React snippet"}
          </button>
          <button
            onClick={handleCopyGlsl}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FFCC11] text-black font-bold text-sm hover:brightness-110 transition"
          >
            {copiedGlsl ? <Check size={16} /> : <Code2 size={16} />}
            {copiedGlsl ? "GLSL copied!" : "Copy GLSL"}
          </button>
        </div>
      </div>

      {/* ── Right: Shader Canvas + GLSL viewer ────────── */}
      <div className="flex-1 relative flex flex-col">
        <div className="flex-1 relative">
          <ShaderCanvas
            type={shader.id}
            uniforms={uniforms}
            colors={colors}
            playing={playing}
            canvasRef={canvasRef}
          />

          {/* Type label overlay */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-sm text-gray-300">
              {shader.label}
            </span>
          </div>

          {/* Description + play state */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-xs text-gray-400 max-w-xs">
              {shader.description}
            </span>
            <span className={`px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-sm ${playing ? "text-green-400" : "text-yellow-400"}`}>
              {playing ? "● Live" : "■ Paused"}
            </span>
          </div>

          {/* In-canvas export shortcuts */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
            <button
              onClick={handleDownloadPng}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-black/70 transition-colors"
            >
              <ImageIcon size={14} />
              PNG frame
            </button>
            <button
              onClick={handleCopyGlsl}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-black/70 transition-colors"
            >
              {copiedGlsl ? <Check size={14} className="text-green-400" /> : <Code2 size={14} />}
              {copiedGlsl ? "Copied" : "GLSL"}
            </button>
          </div>
        </div>

        {/* GLSL source viewer (collapsible) */}
        <div
          className={`shrink-0 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 transition-all ${
            glslOpen ? "h-72" : "h-12"
          }`}
        >
          <div className="flex items-center justify-between px-4 h-12 border-b border-white/10">
            <button
              onClick={() => setGlslOpen(!glslOpen)}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
              aria-expanded={glslOpen}
            >
              <ChevronDown
                size={14}
                className={`transition-transform ${glslOpen ? "" : "-rotate-90"}`}
              />
              <Code2 size={14} className="text-[#FFCC11]" />
              <span className="font-semibold">Fragment Shader</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${selectedTierConfig.color}20`, color: selectedTierConfig.color }}>
                {shader.tier}
              </span>
            </button>
            <button
              onClick={handleCopyGlsl}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-colors"
              aria-label="Copy GLSL source"
            >
              {copiedGlsl ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              {copiedGlsl ? "Copied" : "Copy GLSL"}
            </button>
          </div>
          {glslOpen && (
            <div
              className="overflow-auto bg-black/40 backdrop-blur-xl"
              style={{ height: "calc(100% - 3rem)", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
            >
              <HighlightedGlsl code={shader.glsl} />
            </div>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        requiredTier={upgradeTier}
        featureName={`${upgradeTier === "elite" ? "Elite" : "Pro"} Shaders`}
      />
    </div>
  );
}
