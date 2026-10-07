import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const body = await req.json();
  const { name, description, category, ingredients, spice_level, is_veg, variants, image_url } = body;

  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .insert({ name, description, category, ingredients, spice_level, is_veg })
    .select()
    .single();

  if (productError) {
    console.error(productError);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }

  const variantRows = variants.map((v: any) => ({
    product_id: product.id,
    weight: v.weight,
    price: v.price,
    stock_quantity: v.stock_quantity,
  }));

  const { error: variantError } = await supabaseAdmin
    .from('product_variants')
    .insert(variantRows);

  if (variantError) {
    console.error(variantError);
    return NextResponse.json({ error: 'Failed to create variants' }, { status: 500 });
  }

  if (image_url) {
    const { error: imageError } = await supabaseAdmin.from('product_images').insert({
      product_id: product.id,
      image_url,
      is_primary: true,
    });

    if (imageError) {
      console.error(imageError);
    }
  }

  return NextResponse.json({ success: true, productId: product.id });
}