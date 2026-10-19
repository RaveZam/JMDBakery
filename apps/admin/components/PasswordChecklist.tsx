import type { ReactElement } from "react";
import { Circle, CircleCheck, CircleX } from "lucide-react";

import { cn } from "@/lib/utils";
import { PASSWORD_RULES } from "@/lib/passwordRules";

// Live list of the password rules, re-checked on every keystroke.
// Rules stay neutral until something is typed so an empty field isn't all red.
export function PasswordChecklist({
  password,
}: {
  password: string;
}): ReactElement {
  const started = password.length > 0;

  return (
    <ul className="grid gap-x-4 gap-y-1.5 pt-1 sm:grid-cols-2">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test.test(password);
        const Icon = !started ? Circle : met ? CircleCheck : CircleX;
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-start gap-2 text-xs leading-5 transition-colors motion-reduce:transition-none",
              !started && "text-muted-foreground",
              started && met && "text-emerald-700 dark:text-emerald-400",
              started && !met && "text-destructive",
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {rule.label}
              <span className="sr-only">
                {met ? " (done)" : " (not yet)"}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
