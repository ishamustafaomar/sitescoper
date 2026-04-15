import { motion } from "framer-motion";

interface ScoreRingProps {
  score: number;
  size?: number;
}

export function ScoreRing({ score, size = 112 }: ScoreRingProps) {
  const radius = (size - 16) / 2;
  const color =
    score >= 80
      ? "hsl(var(--accent))"
      : score >= 50
        ? "hsl(var(--primary))"
        : "hsl(var(--destructive))";
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={size > 60 ? 8 : 4}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={size > 60 ? 8 : 4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <span
        className="absolute font-heading font-bold"
        style={{ fontSize: size > 60 ? size * 0.22 : size * 0.3 }}
      >
        {score}
      </span>
    </div>
  );
}
