import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple ignores the web manifest's icons entirely, so this file convention
// is what actually supplies the iOS home-screen icon (Next wires up the
// <link rel="apple-touch-icon"> tag automatically). No transparency, since
// iOS doesn't composite a background behind apple-touch-icons.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "#059669",
            color: "#ffffff",
            fontSize: 84,
            fontWeight: 700,
            fontFamily: "sans-serif",
          }}
        >
          W
        </div>
      </div>
    ),
    { ...size }
  );
}
