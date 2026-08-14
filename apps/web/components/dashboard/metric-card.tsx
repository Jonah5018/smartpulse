interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm transition-all hover:border-blue-700/50 hover:shadow-lg hover:shadow-blue-900/20">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h3 className="mt-3 text-3xl font-bold">
        {value}
      </h3>

      {subtitle && (
        <p className="mt-2 text-sm text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}