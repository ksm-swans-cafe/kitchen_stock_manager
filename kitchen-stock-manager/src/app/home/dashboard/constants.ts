// Dashboard Constants

export const dayColor: Record<string, string> = {
  จันทร์: "from-yellow-400 to-yellow-500",
  อังคาร: "from-pink-400 to-pink-500",
  พุธ: "from-emerald-400 to-emerald-500",
  พฤหัสบดี: "from-orange-400 to-orange-500",
  ศุกร์: "from-sky-400 to-sky-500",
  เสาร์: "from-indigo-400 to-indigo-500",
  อาทิตย์: "from-rose-400 to-rose-500",
};

export const dayNoteColor: Record<string, { light: string; dark: string; hover: string }> = {
  จันทร์: { light: "bg-yellow-50", dark: "bg-yellow-100", hover: "bg-yellow-200" },
  อังคาร: { light: "bg-pink-50", dark: "bg-pink-100", hover: "bg-pink-200" },
  พุธ: { light: "bg-emerald-50", dark: "bg-emerald-100", hover: "bg-emerald-200" },
  พฤหัสบดี: { light: "bg-orange-50", dark: "bg-orange-100", hover: "bg-orange-200" },
  ศุกร์: { light: "bg-sky-50", dark: "bg-sky-100", hover: "bg-sky-200" },
  เสาร์: { light: "bg-indigo-50", dark: "bg-indigo-100", hover: "bg-indigo-200" },
  อาทิตย์: { light: "bg-rose-50", dark: "bg-rose-100", hover: "bg-rose-200" },
};

export const dayNoteTextColor: Record<string, string> = {
  จันทร์: "text-yellow-700", อังคาร: "text-pink-700", พุธ: "text-emerald-700",
  พฤหัสบดี: "text-orange-700", ศุกร์: "text-sky-700", เสาร์: "text-indigo-700", อาทิตย์: "text-rose-700",
};

export const dayAuraColor: Record<string, { class: string; style: React.CSSProperties }> = {
  จันทร์: { class: "ring-2 ring-yellow-400 animate-auraGlow", style: { "--aura-color": "rgba(250,204,21,0.4)" } as React.CSSProperties },
  อังคาร: { class: "ring-2 ring-pink-400 animate-auraGlow", style: { "--aura-color": "rgba(236,72,153,0.4)" } as React.CSSProperties },
  พุธ: { class: "ring-2 ring-emerald-400 animate-auraGlow", style: { "--aura-color": "rgba(52,211,153,0.4)" } as React.CSSProperties },
  พฤหัสบดี: { class: "ring-2 ring-orange-400 animate-auraGlow", style: { "--aura-color": "rgba(251,146,60,0.4)" } as React.CSSProperties },
  ศุกร์: { class: "ring-2 ring-sky-400 animate-auraGlow", style: { "--aura-color": "rgba(56,189,248,0.4)" } as React.CSSProperties },
  เสาร์: { class: "ring-2 ring-indigo-400 animate-auraGlow", style: { "--aura-color": "rgba(129,140,248,0.4)" } as React.CSSProperties },
  อาทิตย์: { class: "ring-2 ring-rose-400 animate-auraGlow", style: { "--aura-color": "rgba(251,113,133,0.4)" } as React.CSSProperties },
};

export const dayColorLegend = [
  { label: "จันทร์", className: "bg-yellow-400" },
  { label: "อังคาร", className: "bg-pink-400" },
  { label: "พุธ", className: "bg-emerald-400" },
  { label: "พฤหัสบดี", className: "bg-orange-400" },
  { label: "ศุกร์", className: "bg-sky-400" },
  { label: "เสาร์", className: "bg-indigo-400" },
  { label: "อาทิตย์", className: "bg-rose-400" },
];

export const monthNamesShort = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
