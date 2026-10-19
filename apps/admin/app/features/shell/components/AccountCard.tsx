"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountAvatar } from "./AccountAvatar";
import { AccountMenuHeader } from "./AccountMenuHeader";
import { SignOutConfirmDialog } from "./SignOutConfirmDialog";
import { SignOutMenuItem } from "./SignOutMenuItem";
import { useAccountUser } from "../hooks/useAccountUser";

export function AccountCard() {
  const user = useAccountUser();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 hover:bg-muted"
          >
            <AccountAvatar name={user.name} />
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold">
                {user.email || "No email"}
              </p>
              <p className="text-xs text-muted-foreground">
                Account preferences
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          className="w-64 rounded-2xl p-1.5"
        >
          <AccountMenuHeader name={user.name} email={user.email} />
          <SignOutMenuItem onSelect={() => setConfirmingSignOut(true)} />
        </DropdownMenuContent>
      </DropdownMenu>
      <SignOutConfirmDialog
        open={confirmingSignOut}
        onOpenChange={setConfirmingSignOut}
      />
    </>
  );
}

export default AccountCard;
