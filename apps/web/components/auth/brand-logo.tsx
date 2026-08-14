export function BrandLogo() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-4 w-4 rounded-full bg-blue-600 shadow-lg shadow-blue-600/40" />

        <h1 className="text-3xl font-bold tracking-tight">
          SmartPulse
        </h1>
      </div>

      <p className="max-w-xs text-sm text-slate-400">
        Institutional Market Intelligence
        <br />
        for Retail Traders
      </p>
    </div>
  );
}