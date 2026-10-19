import type { ReactElement } from "react";
import { avatarColor } from "../core/avatarColor";
import { initials } from "../core/initials";

export function AccountAvatar({
  name,
}: {
  name: string | null | undefined;
}): ReactElement {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${name ? avatarColor(name) : "bg-muted"}`}
    >
      {name ? initials(name) : null}
    </div>
  );
}
