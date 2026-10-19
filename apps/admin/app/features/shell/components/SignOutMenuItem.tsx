import type { ReactElement } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function SignOutMenuItem({
  onSelect,
}: {
  onSelect: () => void;
}): ReactElement {
  return (
    <DropdownMenuItem
      asChild
      onSelect={onSelect}
      className="mt-1 p-0 focus:bg-transparent">
      <Button
        type="button"
        variant="ghost"
        className="h-10 w-full justify-start rounded-xl px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut />
        Sign out
      </Button>
    </DropdownMenuItem>
  );
}
