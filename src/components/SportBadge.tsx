interface SportBadgeProps {
  name: string;
  icon?: string | null;
  iconUrl?: string | null;
  size?: "sm" | "md";
  variant?: "pill" | "inline";
}

export default function SportBadge({
  name,
  icon,
  iconUrl,
  size = "md",
  variant = "pill",
}: SportBadgeProps) {
  const imgSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  const iconEl = iconUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={iconUrl} alt={name} className={`${imgSize} object-contain rounded-sm`} />
  ) : icon ? (
    <span>{icon}</span>
  ) : null;

  if (variant === "inline") {
    return (
      <span className="flex items-center gap-1.5">
        {iconEl}
        <span>{name}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-600 bg-[#0B5C71]/10 text-[#0B5C71] border border-[#0B5C71]/20">
      {iconEl}
      {name}
    </span>
  );
}
