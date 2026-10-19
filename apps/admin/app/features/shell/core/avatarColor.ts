const AVATAR_COLORS = [
  "bg-blue-200 text-blue-800",
  "bg-violet-200 text-violet-800",
  "bg-rose-200 text-rose-800",
  "bg-amber-200 text-amber-800",
  "bg-emerald-200 text-emerald-800",
  "bg-cyan-200 text-cyan-800",
  "bg-pink-200 text-pink-800",
  "bg-orange-200 text-orange-800",
];

export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
