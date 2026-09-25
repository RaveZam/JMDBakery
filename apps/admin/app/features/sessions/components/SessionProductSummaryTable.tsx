import type { ReactElement } from "react";

import { formatCurrencyPHP } from "@/lib/utils";
import type { SessionProductSummaryRow } from "../types/session-types";

function ProductTotalsRow({
  products,
}: {
  products: SessionProductSummaryRow[];
}): ReactElement {
  const piecesSold = products.reduce((sum, p) => sum + p.piecesSold, 0);
  const revenue = products.reduce((sum, p) => sum + p.revenue, 0);
  const piecesBO = products.reduce((sum, p) => sum + p.piecesBO, 0);
  const boValue = products.reduce((sum, p) => sum + p.boValue, 0);
  return (
    <tr className="border-t border-border/50">
      <td className="py-1 font-medium">Total</td>
      <td />
      <td className="py-1 text-right font-medium">{piecesSold}</td>
      <td className="py-1 text-right font-medium">
        {formatCurrencyPHP(revenue)}
      </td>
      <td className="py-1 text-right font-medium">{piecesBO}</td>
      <td className="py-1 text-right font-medium">
        {formatCurrencyPHP(boValue)}
      </td>
    </tr>
  );
}

function ProductSummaryRow({
  product,
}: {
  product: SessionProductSummaryRow;
}): ReactElement {
  return (
    <tr className="border-t border-border/50">
      <td className="py-1 pr-2">{product.productName}</td>
      <td className="py-1 pr-2 whitespace-nowrap text-muted-foreground">
        {formatCurrencyPHP(product.price)}
      </td>
      <td className="py-1 text-right">{product.piecesSold}</td>
      <td className="py-1 text-right">{formatCurrencyPHP(product.revenue)}</td>
      <td className="py-1 text-right">{product.piecesBO}</td>
      <td className="py-1 text-right">{formatCurrencyPHP(product.boValue)}</td>
    </tr>
  );
}

export function SessionProductSummaryTable({
  products,
}: {
  products: SessionProductSummaryRow[];
}): ReactElement {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-muted-foreground">
          <th className="pb-1 text-left font-medium">Product</th>
          <th className="pb-1 text-left font-medium">Price</th>
          <th className="pb-1 text-right font-medium">Sold</th>
          <th className="pb-1 text-right font-medium">Revenue</th>
          <th className="pb-1 text-right font-medium">B.O.</th>
          <th className="pb-1 text-right font-medium">B.O. value</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <ProductSummaryRow
            key={`${product.productName}:${product.price}`}
            product={product}
          />
        ))}
      </tbody>
      <tfoot>
        <ProductTotalsRow products={products} />
      </tfoot>
    </table>
  );
}
