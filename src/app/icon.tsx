import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(150deg, #4aa888 0%, #1f4d3d 100%)",
          color: "#f7f3ea",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: 1,
        }}
      >
        CV
      </div>
    ),
    size,
  );
}
