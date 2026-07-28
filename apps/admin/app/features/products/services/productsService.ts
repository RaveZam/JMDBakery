"use server";

import { createClient } from "@/utils/supabase/server";
import type { Product, ProductInput } from "../types/product-types";

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, product_name, product_price")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.product_name as string,
    price: Number(p.product_price),
  }));
}

export async function addProduct(input: ProductInput): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({ product_name: input.name, product_price: input.price })
    .select("id, product_name, product_price")
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    name: data.product_name as string,
    price: Number(data.product_price),
  };
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ product_name: input.name, product_price: input.price })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

// Soft delete, not a real delete: the agent app pulls changed rows by
// updated_at, and a row that vanishes outright never shows up in that pull, so
// the product would stay on agents' phones forever. Its price modifiers go with
// it so they don't outlive the product they belong to.
export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const deletedAt = new Date().toISOString();

  const { error } = await supabase
    .from("products")
    .update({ deleted_at: deletedAt })
    .eq("id", id);

  if (error) throw new Error(error.message);

  const { error: modifiersError } = await supabase
    .from("province_price_modifiers")
    .update({ deleted_at: deletedAt })
    .eq("product_id", id)
    .is("deleted_at", null);

  if (modifiersError) throw new Error(modifiersError.message);
}
