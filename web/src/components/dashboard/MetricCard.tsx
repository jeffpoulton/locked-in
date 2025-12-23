"use client";

type ColorScheme = "green" | "red" | "blue" | "neutral";

interface MetricCardProps {
  /** Metric label */
  label: string;
  /** Metric value (can be string or number) */
  value: string | number;
  /** Color scheme */
  colorScheme: ColorScheme;
}

/**
 * Individual metric card for the metrics matrix.
 *
 * Displays a single metric with label and value, styled according to color scheme.
 */
export function MetricCard({ label, value, colorScheme }: MetricCardProps) {
  // Color mappings
  const colorClasses = {
    green: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
    red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    neutral: "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  };

  const valueColorClasses = {
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    blue: "text-blue-600 dark:text-blue-400",
    neutral: "text-foreground",
  };

  return (
    <div className={`rounded-xl px-4 py-3 ${colorClasses[colorScheme]}`}>
      <p className="text-xs font-medium mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${valueColorClasses[colorScheme]}`}>
        {value}
      </p>
    </div>
  );
}
