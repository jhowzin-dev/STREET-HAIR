interface TotalDisplayProps {
  label?: string;
  value?: number;
}

export function TotalDisplay({ label = "total:", value }: TotalDisplayProps) {
  const formattedValue = value ? `R$ ${value.toFixed(2).replace(".", ",")}` : "R$ 0,00";
  
  return (
    <div className="bg-neutral-800 border border-white/20 rounded-xl px-4 py-3 flex items-center justify-between w-full max-w-sm">
      <span className="text-white/60 text-xs uppercase tracking-wider">{label}</span>
      <span className="text-white text-lg font-semibold">{formattedValue}</span>
    </div>
  );
}