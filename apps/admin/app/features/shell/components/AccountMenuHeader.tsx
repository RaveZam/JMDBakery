import type { ReactElement } from "react";
import { AccountAvatar } from "./AccountAvatar";

export function AccountMenuHeader({
  name,
  email,
}: {
  name: string | null | undefined;
  email: string | null | undefined;
}): ReactElement {
  // The name falls back to the email, so only show it when they differ.
  const hasName = name && name !== email;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
      <AccountAvatar name={name} />
      <div className="min-w-0">
        {hasName ? (
          <p className="truncate text-sm font-semibold">{name}</p>
        ) : null}
        <p className="truncate text-xs text-muted-foreground">
          {email || "No email"}
        </p>
      </div>
    </div>
  );
}
