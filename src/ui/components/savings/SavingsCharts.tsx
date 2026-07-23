import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SavingsTimelinePoint } from "../../../domain/services/savingsSummary";

/**
 * Hand-rolled SVG charts for the savings route (no chart library).
 * Single-series each: identity comes from the card title, values from
 * tooltips/axis labels in text tokens — never painted in the series color.
 */

const W = 600;
const H = 220;
const PAD = { top: 16, right: 64, bottom: 28, left: 12 };

const compact = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  notation: "compact",
  maximumFractionDigits: 1,
});

function niceMax(value: number): number {
  if (value <= 0) return 1;
  return value * 1.08;
}

function xScale(index: number, count: number): number {
  const inner = W - PAD.left - PAD.right;
  if (count <= 1) return PAD.left + inner / 2;
  return PAD.left + (inner * index) / (count - 1);
}

function GridLines({ max }: { max: number }) {
  const ys = [0, 0.5, 1];
  return (
    <>
      {ys.map((f) => {
        const y = H - PAD.bottom - f * (H - PAD.top - PAD.bottom);
        return (
          <g key={f}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y}
              y2={y}
              stroke="rgb(255 255 255 / 0.12)"
              strokeWidth={1}
              strokeDasharray="2 4"
            />
            <text
              x={W - PAD.right + 8}
              y={y + 4}
              fontSize={11}
              fill="rgb(255 255 255 / 0.45)"
              className="tabular-nums"
            >
              {compact.format(f * max)}
            </text>
          </g>
        );
      })}
    </>
  );
}

interface TooltipState {
  index: number;
  xPct: number;
  yPct: number;
}

function ChartTooltip({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="pointer-events-none rounded-xl border border-white/10 bg-panel/95 px-3 py-2 text-xs shadow-lg shadow-black/40 backdrop-blur">
      <p className="font-medium text-white">{title}</p>
      {lines.map((l) => (
        <p key={l} className="tabular-nums text-white/60">
          {l}
        </p>
      ))}
    </div>
  );
}

/** Cumulative balance over time: 2px periwinkle line + soft area, ≥8px markers. */
export function BalanceLineChart({ timeline }: { timeline: SavingsTimelinePoint[] }) {
  const { t } = useTranslation();
  const [hover, setHover] = useState<TooltipState | null>(null);
  if (timeline.length === 0) return null;

  const max = niceMax(Math.max(...timeline.map((p) => p.balanceAfter.toNumber())));
  const y = (v: number) => H - PAD.bottom - (v / max) * (H - PAD.top - PAD.bottom);
  const points = timeline.map((p, i) => ({
    x: xScale(i, timeline.length),
    y: y(p.balanceAfter.toNumber()),
    point: p,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath =
    `${linePath} L${points[points.length - 1].x},${H - PAD.bottom} ` +
    `L${points[0].x},${H - PAD.bottom} Z`;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    for (let i = 1; i < points.length; i++) {
      if (Math.abs(points[i].x - mouseX) < Math.abs(points[nearest].x - mouseX)) nearest = i;
    }
    setHover({
      index: nearest,
      xPct: (points[nearest].x / W) * 100,
      yPct: (points[nearest].y / H) * 100,
    });
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={t("savings.chartBalanceAria")}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <GridLines max={max} />
        {hover && (
          <line
            x1={points[hover.index].x}
            x2={points[hover.index].x}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke="rgb(255 255 255 / 0.25)"
            strokeWidth={1}
            strokeDasharray="2 4"
          />
        )}
        <path d={areaPath} fill="color-mix(in srgb, var(--color-peri) 14%, transparent)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-peri)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={p.point.id}
            cx={p.x}
            cy={p.y}
            r={hover?.index === i ? 5 : 4}
            fill="var(--color-peri)"
            stroke="var(--color-panel)"
            strokeWidth={2}
          />
        ))}
      </svg>
      {hover && (
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-full pt-0 pb-2"
          style={{ left: `${hover.xPct}%`, top: `${hover.yPct}%` }}
        >
          <ChartTooltip
            title={timeline[hover.index].date}
            lines={[
              t("savings.tooltipBalance", { amount: timeline[hover.index].balanceAfter.format() }),
              timeline[hover.index].kind === "returns"
                ? t("savings.tooltipReturns", { amount: timeline[hover.index].amount.format() })
                : t("savings.tooltipDeposit", { amount: timeline[hover.index].amount.format() }),
            ]}
          />
        </div>
      )}
    </div>
  );
}

function roundedTopBar(x: number, yTop: number, width: number, yBase: number, r = 4): string {
  const rr = Math.min(r, width / 2, Math.max(yBase - yTop, 0));
  return (
    `M${x},${yBase} L${x},${yTop + rr} Q${x},${yTop} ${x + rr},${yTop} ` +
    `L${x + width - rr},${yTop} Q${x + width},${yTop} ${x + width},${yTop + rr} ` +
    `L${x + width},${yBase} Z`
  );
}

/** Returns per entry: thin mint bars, 4px rounded data-end, anchored to the baseline. */
export function ReturnsBarChart({ timeline }: { timeline: SavingsTimelinePoint[] }) {
  const { t } = useTranslation();
  const [hover, setHover] = useState<TooltipState | null>(null);
  const returns = timeline.filter((p) => p.kind === "returns");
  if (returns.length === 0) return null;

  const max = niceMax(Math.max(...returns.map((p) => p.amount.toNumber())));
  const inner = W - PAD.left - PAD.right;
  const slot = inner / returns.length;
  const barWidth = Math.min(28, Math.max(8, slot - 8));
  const yBase = H - PAD.bottom;
  const yFor = (v: number) => yBase - (v / max) * (H - PAD.top - PAD.bottom);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={t("savings.chartReturnsAria")}
        onMouseLeave={() => setHover(null)}
      >
        <GridLines max={max} />
        {returns.map((p, i) => {
          const x = PAD.left + slot * i + (slot - barWidth) / 2;
          const yTop = yFor(p.amount.toNumber());
          return (
            <g key={p.id}>
              {/* oversized hit target */}
              <rect
                x={PAD.left + slot * i}
                y={PAD.top}
                width={slot}
                height={H - PAD.top - PAD.bottom}
                fill="transparent"
                onMouseEnter={() =>
                  setHover({
                    index: i,
                    xPct: ((x + barWidth / 2) / W) * 100,
                    yPct: (yTop / H) * 100,
                  })
                }
              />
              <path
                d={roundedTopBar(x, yTop, barWidth, yBase)}
                fill="var(--color-mint)"
                opacity={hover === null || hover.index === i ? 1 : 0.5}
              />
              <text
                x={x + barWidth / 2}
                y={H - 10}
                textAnchor="middle"
                fontSize={10}
                fill="rgb(255 255 255 / 0.45)"
                className="tabular-nums"
              >
                {p.date.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
      {hover && (
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-full pb-2"
          style={{ left: `${hover.xPct}%`, top: `${hover.yPct}%` }}
        >
          <ChartTooltip
            title={returns[hover.index].date}
            lines={[t("savings.tooltipReturns", { amount: returns[hover.index].amount.format() })]}
          />
        </div>
      )}
    </div>
  );
}
