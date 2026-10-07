import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, description, category, ingredients, spice_level, is_veg, variants, image_url } = body;

  const { error: productError } = await supabaseAdmin
    .from('products')
    .update({ name, description, category, ingredients, spice_level, is_veg })
    .eq('id', id);

  if (productError) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }

  const { data: existingVariants } = await supabaseAdmin
    .from('product_variants')
    .select('id')
    .eq('product_id', id);

  const existingIds = new Set((existingVariants ?? []).map((v: any) => v.id));
  const submittedExistingIds = new Set(
    variants.filter((v: any) => existingIds.has(v.id)).map((v: any) => v.id)
  );

  // Update variants that already exist in the database
  for (const v of variants) {
    if (existingIds.has(v.id)) {
      await supabaseAdmin
        .from('product_variants')
        .update({ weight: v.weight, price: v.price, stock_quantity: v.stock_quantity })
        .eq('id', v.id);
    }
  }

  // Insert genuinely new variants (ones not already in the database)
  const newVariants = variants.filter((v: any) => !existingIds.has(v.id));
  if (newVariants.length > 0) {
    const rows = newVariants.map((v: any) => ({
      product_id: id,
      weight: v.weight,
      price: v.price,
      stock_quantity: v.stock_quantity,
    }));
    await supabaseAdmin.from('product_variants').insert(rows);
  }

  // Remove variants that were deleted in the form — but skip any protected by order history
  const removedIds = [...existingIds].filter((eid) => !submittedExistingIds.has(eid));
  for (const rid of removedIds) {
    const { error: delErr } = await supabaseAdmin.from('product_variants').delete().eq('id', rid);
    if (delErr) {
      console.warn(`Variant ${rid} has order history and cannot be deleted — left in place.`);
    }
  }

  // Save the image: replace any existing image for this product
  if (image_url) {
    await supabaseAdmin.from('product_images').delete().eq('product_id', id);
    await supabaseAdmin.from('product_images').insert({
      product_id: id,
      image_url,
      is_primary: true,
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}