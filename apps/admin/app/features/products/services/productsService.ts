"use server";

import { createClient } from "@/utils/supabase/server";
import type { Product, ProductInput } from "../types/product-types";

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, product_name, product_price")
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

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw new Error(error.message);
}
