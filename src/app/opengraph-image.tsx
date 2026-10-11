import { ImageResponse } from "next/og";

// One generic card for every page, including /m/<id> links. It must never carry anything about a secret.
export const alt = "Mann Ni Vaat: a secret that opens once";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLS = 5;
const ROWS = 5;

function Rosette({ x, y }: { x: number; y: number }) {
  const dot = (dx: number, dy: number, s: number) => (
    <div
      style={{
        position: "absolute",
        left: x + dx - s / 2,
        top: y + dy - s / 2,
        width: s,
        height: s,
        borderRadius: 999,
        background: "#f4b83d",
      }}
    />
  );
  return (
    <>
      {dot(0, 0, 16)}
      {dot(0, -22, 10)}
      {dot(0, 22, 10)}
      {dot(-22, 0, 10)}
      {dot(22, 0, 10)}
    </>
  );
}

export default function Image() {
  const cloth = 440;
  const stepX = cloth / COLS;
  const stepY = cloth / ROWS;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#15143a",
          padding: "0 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", color: "#e6e9f5" }}>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05 }}>Mann Ni Vaat</div>
          <div style={{ fontSize: 40, marginTop: 28, color: "#a9aed0" }}>A secret is waiting for you.</div>
          <div style={{ fontSize: 40, marginTop: 8, color: "#f4b83d" }}>It opens once.</div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            width: cloth,
            height: cloth,
            borderRadius: 36,
            background: "#e0384f",
          }}
        >
          {Array.from({ length: COLS * ROWS }, (_, i) => (
            <Rosette
              key={i}
              x={stepX / 2 + (i % COLS) * stepX}
              y={stepY / 2 + Math.floor(i / COLS) * stepY}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: cloth / 2 - 56,
              top: cloth / 2 - 56,
              width: 112,
              height: 112,
              borderRadius: 999,
              background: "#b32339",
              border: "8px solid #f4b83d",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
