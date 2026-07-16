import type { ReactElement } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Product } from "../types/product-types";
import { formatCurrencyPHP } from "../helpers/formatCurrency";

type ProductRowProps = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductRow({
  product,
  onEdit,
  onDelete,
}: ProductRowProps): ReactElement {
  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3 font-medium">{product.name}</td>
      <td className="px-4 py-3 text-muted-foreground">
        {formatCurrencyPHP(product.price)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Edit ${product.name}`}
            onClick={() => onEdit(product)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Delete ${product.name}`}
            onClick={() => onDelete(product)}
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
