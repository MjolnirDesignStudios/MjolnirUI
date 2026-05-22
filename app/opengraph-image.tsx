// app/opengraph-image.tsx
// Next.js generates this as a real 1200×630 PNG at build time via the
// ImageResponse API. Replaces the missing /public/og-image.jpg.
//
// The output is what every link-preview (iMessage, Slack, FB/IG, LinkedIn,
// Discord, Twitter via twitter-image.tsx below) renders when somebody pastes
// a MjolnirUI URL. Until 2026-05-22 the link previews 404'd — this fixes it.
//
// Design:
//   - Black background with a radial gold bifrost glow
//   - Large "MjolnirUI" wordmark in white
//   - Gold accent slab + tagline
//   - Bottom-right Mjolnir Design Studios attribution
//
// Replace this with a hand-designed PNG later if desired — drop the file at
// /public/og-image.png and Next will prefer the static file. For now this is
// a respectable placeholder that ships immediately.
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MjolnirUI — Premium React Component Library";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "radial-gradient(ellipse 1400px 800px at 20% 20%, rgba(255,204,17,0.18) 0%, transparent 50%), radial-gradient(ellipse 1000px 600px at 100% 100%, rgba(0,240,255,0.12) 0%, transparent 60%), linear-gradient(135deg, #020617 0%, #0a0a0f 50%, #0f172a 100%)",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top — Mjolnir Design Studios eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "22px",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#FFCC11",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#FFCC11",
              boxShadow: "0 0 24px #FFCC11",
            }}
          />
          Mjolnir Design Studios
        </div>

        {/* Center — wordmark + tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "160px",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              display: "flex",
              alignItems: "baseline",
            }}
          >
            <span style={{ color: "white" }}>Mjolnir</span>
            <span style={{ color: "#FFCC11" }}>UI</span>
          </div>
          <div
            style={{
              fontSize: "40px",
              fontWeight: 500,
              lineHeight: 1.2,
              color: "#a1a1aa",
              maxWidth: "920px",
            }}
          >
            Premium React components, GLSL shaders, and AI-powered design
            tooling — forged for builders.
          </div>
        </div>

        {/* Bottom — feature chips + URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {["React 19", "Next.js 16", "Tailwind v4", "Three.js", "Stripe"].map(
              (tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    padding: "10px 20px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "white",
                    fontSize: "22px",
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </div>
              )
            )}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "26px",
              fontWeight: 700,
              padding: "14px 24px",
              borderRadius: "12px",
              background: "#FFCC11",
              color: "#000",
            }}
          >
            mjolnirui.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
