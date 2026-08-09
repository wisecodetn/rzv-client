import { ImageResponse } from "next/og"

export const size = { width: 96, height: 96 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#241A10", color: "#E2BB88", fontSize: 62, fontWeight: 800 }}>
        R
      </div>
    ),
    { ...size },
  )
}
