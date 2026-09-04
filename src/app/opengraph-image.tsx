import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CV FORGE — Creador de currículum gratis, sin publicidad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(145deg, #f4efe6 0%, #fffdf8 48%, #e7f0ea 100%)",
          color: "#161411",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(150deg, #4aa888 0%, #1f4d3d 100%)",
              color: "#f7f3ea",
              fontSize: 22,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              letterSpacing: 1,
            }}
          >
            CV
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: 4,
            }}
          >
            CV FORGE
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1,
              maxWidth: 900,
            }}
          >
            Crea tu currículum gratis.
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#5c564e",
              maxWidth: 820,
            }}
          >
            Sin publicidad. Sin fines de lucro. Con o sin cuenta.
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 22, color: "#1f4d3d" }}>
          <span>Fácil de usar</span>
          <span>·</span>
          <span>11 plantillas</span>
          <span>·</span>
          <span>PDF A4</span>
        </div>
      </div>
    ),
    size,
  );
}
