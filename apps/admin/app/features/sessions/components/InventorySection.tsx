"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { ChevronDown, ChevronRight, Loader2, Package } from "lucide-react";

import type { SessionInventoryRow } from "../types/session-types";

export function InventorySection({
  inventory,
  loading,
}: {
  inventory: SessionInventoryRow[];
  loading: boolean;
}): ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border bg-background">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-sm font-medium">Morning Inventory</span>
        {!loading && (
          <span className="text-xs text-muted-foreground">
            {inventory.length} product{inventory.length !== 1 ? "s" : ""}
          </span>
        )}
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="border-t border-border/50 px-3 py-2">
          {loading ? (
            <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading inventory...
            </div>
          ) : inventory.length === 0 ? (
            <p className="py-3 text-xs text-muted-foreground">
              No inventory recorded for this session.
            </p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="pb-1 text-left font-medium">Product</th>
                  <th className="pb-1 text-right font-medium">Qty</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-t border-border/50">
                    <td className="py-1 pr-2">{item.productName}</td>
                    <td className="py-1 text-right">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-1 font-medium">Total</td>
                  <td className="py-1 text-right font-medium">
                    {inventory.reduce((sum, i) => sum + i.quantity, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
