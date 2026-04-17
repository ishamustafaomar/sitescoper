interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({ values, width = 80, height = 24, className }: SparklineProps) {
  if (!values || values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const last = values[values.length - 1];
  const first = values[0];
  const trendUp = last >= first;
  const stroke = trendUp ? "hsl(var(--accent))" : "hsl(var(--destructive))";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* end dot */}
      <circle
        cx={width}
        cy={height - ((last - min) / range) * (height - 4) - 2}
        r="2"
        fill={stroke}
      />
    </svg>
  );
}
