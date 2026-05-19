interface BookingOptionProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}

export function BookingOption({ icon, text, onClick }: BookingOptionProps) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 bg-white rounded-xl p-6 w-full mb-6 cursor-pointer
     hover:bg-white/90 active:scale-[0.98] active:bg-white/80
     transition-all duration-150"
    >
      <div className="text-black/80">{icon}</div>
      <span className="text-black/90 text-lg font-light">{text}</span>
    </div>
  );
}