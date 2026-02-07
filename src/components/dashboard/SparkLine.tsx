"use client";

interface SparkLineProps {
  data: number[];
  color?: string;
  height?: number;
}

export default function SparkLine({
  data,
  color = "#3b82f6",
  height = 32,
}: SparkLineProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const barWidth = 100 / data.length;

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
    >
      {data.map((value, i) => {
        const barHeight = max > 0 ? (value / max) * height * 0.9 : 0;
        return (
          <rect
            key={i}
            x={i * barWidth + barWidth * 0.15}
            y={height - barHeight}
            width={barWidth * 0.7}
            height={barHeight}
            rx={1}
            fill={color}
            opacity={0.6 + (i / data.length) * 0.4}
          />
        );
      })}
    </svg>
  );
}
