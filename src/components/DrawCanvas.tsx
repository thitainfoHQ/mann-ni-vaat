"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { useT } from "@/lib/i18n";

export type DrawHandle = {
  isEmpty: () => boolean;
  /** Returns a compressed data URL, or null if it can't fit the size limit. */
  exportImage: () => string | null;
};

type Stroke = { color: string; size: number; erase: boolean; pts: [number, number][] };

const W = 720;
const H = 900;
const PAPER = "#fbf6ea";
export const MAX_IMAGE_CHARS = 450_000;
const COLOURS = [
  { name: "Ink", value: "#1c1b3a" },
  { name: "Red", value: "#e0384f" },
  { name: "Haldi", value: "#f4b83d" },
  { name: "Teal", value: "#1fa39a" },
  { name: "Indigo", value: "#4a47b8" },
  { name: "Pink", value: "#ee7fa6" },
];
const SIZES = [6, 14, 28];

function paint(ctx: CanvasRenderingContext2D, s: Stroke) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = s.size;
  ctx.strokeStyle = s.erase ? PAPER : s.color;
  ctx.fillStyle = s.erase ? PAPER : s.color;
  if (s.pts.length === 1) {
    ctx.beginPath();
    ctx.arc(s.pts[0][0], s.pts[0][1], s.size / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(s.pts[0][0], s.pts[0][1]);
  for (let i = 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i][0], s.pts[i][1]);
  ctx.stroke();
}

export default function DrawCanvas({ ref }: { ref?: Ref<DrawHandle> }) {
  const { t } = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const [colour, setColour] = useState(COLOURS[0].value);
  const [size, setSize] = useState(SIZES[1]);
  const [erase, setErase] = useState(false);
  const [count, setCount] = useState(0);

  const redraw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
    strokes.current.forEach((s) => paint(ctx, s));
  }, []);

  useEffect(redraw, [redraw]);

  useImperativeHandle(ref, () => ({
    isEmpty: () => strokes.current.length === 0,
    exportImage: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      // Try full size, then smaller copies, with webp first (png is the fallback on older Safari).
      for (const [scale, q] of [[1, 0.8], [1, 0.6], [0.75, 0.6], [0.5, 0.6]] as const) {
        const out = document.createElement("canvas");
        out.width = Math.round(W * scale);
        out.height = Math.round(H * scale);
        out.getContext("2d")!.drawImage(canvas, 0, 0, out.width, out.height);
        const url = out.toDataURL("image/webp", q);
        if (url.length <= MAX_IMAGE_CHARS) return url;
      }
      return null;
    },
  }));

  const point = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    current.current = { color: colour, size, erase, pts: [point(e)] };
    const ctx = e.currentTarget.getContext("2d")!;
    paint(ctx, current.current);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = current.current;
    if (!s) return;
    const prev = s.pts[s.pts.length - 1];
    const next = point(e);
    s.pts.push(next);
    const ctx = e.currentTarget.getContext("2d")!;
    paint(ctx, { ...s, pts: [prev, next] });
  };
  const onUp = () => {
    if (!current.current) return;
    strokes.current.push(current.current);
    current.current = null;
    setCount(strokes.current.length);
  };

  const undo = () => {
    strokes.current.pop();
    setCount(strokes.current.length);
    redraw();
  };
  const clear = () => {
    strokes.current = [];
    setCount(0);
    redraw();
  };

  const tool =
    "min-h-11 rounded-lg border border-raat-line px-3 text-sm font-semibold text-abhla transition-colors hover:border-abhla-dim disabled:opacity-40";

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        role="img"
        aria-label={t.drawLabel}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="block aspect-[4/5] w-full touch-none cursor-crosshair rounded-[18px] border border-raat-line"
        style={{ background: PAPER }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label={t.colour}>
        {COLOURS.map((c) => (
          <button
            key={c.value}
            type="button"
            aria-label={c.name}
            aria-pressed={!erase && colour === c.value}
            onClick={() => {
              setColour(c.value);
              setErase(false);
            }}
            className="grid size-11 place-items-center rounded-full"
          >
            <span
              className={`block size-8 rounded-full border-2 ${!erase && colour === c.value ? "border-haldi ring-2 ring-abhla" : "border-raat-line"}`}
              style={{ background: c.value }}
            />
          </button>
        ))}
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1" role="group" aria-label={t.brush}>
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`${t.brush} ${s}`}
              aria-pressed={size === s}
              onClick={() => setSize(s)}
              className="grid size-11 place-items-center rounded-lg"
            >
              <span
                className={`block rounded-full ${size === s ? "bg-haldi" : "bg-abhla-dim"}`}
                style={{ width: Math.max(8, s * 0.7), height: Math.max(8, s * 0.7) }}
              />
            </button>
          ))}
        </div>
        <button type="button" aria-pressed={erase} onClick={() => setErase((v) => !v)} className={`${tool} ${erase ? "border-haldi text-haldi" : ""}`}>
          {t.eraser}
        </button>
        <button type="button" onClick={undo} disabled={count === 0} className={tool}>
          {t.undo}
        </button>
        <button type="button" onClick={clear} disabled={count === 0} className={tool}>
          {t.clear}
        </button>
      </div>
    </div>
  );
}
