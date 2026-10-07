"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, ArrowLeft, X } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import { Product, ProductVariant } from "@/lib/data";
import Image from "next/image";

export default function AdminProductsPage() {
  const [mounted, setMounted] = useState(false);
  const { products, deleteProduct, addProduct, updateProduct, fetchProducts } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    ingredients: "",
    spice_level: "Medium",
    is_veg: true,
    image_url: "",
  });

  const [variants, setVariants] = useState<ProductVariant[]>([
    { id: `v_${Date.now()}`, weight: "250g", price: 0, stock_quantity: 0 }
  ]);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, []);

  if (!mounted) return null;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "", description: "", category: "Mango", ingredients: "", spice_level: "Medium", is_veg: true, image_url: ""
    });
    setVariants([{ id: `v_${Date.now()}`, weight: "250g", price: 0, stock_quantity: 0 }]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      ingredients: product.ingredients,
      spice_level: product.spice_level,
      is_veg: product.is_veg,
      image_url: product.image_url,
    });
    setVariants([...product.variants]);
    setIsFormOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setFormData((prev) => ({ ...prev, image_url: data.url }));
    } catch (error) {
      console.error(error);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (variants.length === 0) {
      alert("At least one variant is required");
      return;
    }

    const productData: Product = {
      id: editingProduct ? editingProduct.id : `p_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      ingredients: formData.ingredients,
      spice_level: formData.spice_level as "Mild" | "Medium" | "Hot",
      is_veg: formData.is_veg,
      image_url: formData.image_url || "https://images.unsplash.com/photo-1596484552834-6a58f850b0a1?auto=format&fit=crop&q=80&w=600",
      variants: variants,
    };

    const success = editingProduct
      ? await updateProduct(productData)
      : await addProduct(productData);

    if (success) {
      setIsFormOpen(false);
    } else {
      alert("Something went wrong saving the product. Please try again.");
    }
  };

  const addVariant = () => {
    setVariants([...variants, { id: `v_${Date.now()}`, weight: "", price: 0, stock_quantity: 0 }]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <main className="p-6 md:p-8 max-w-4xl mx-auto">
        <button
          onClick={() => setIsFormOpen(false)}
          className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </button>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="font-serif text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border border-border rounded-md bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <input required type="text" placeholder="e.g. Mango, Lemon" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border border-border rounded-md bg-background" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border border-border rounded-md bg-background" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Ingredients</label>
                <textarea required rows={2} value={formData.ingredients} onChange={e => setFormData({ ...formData, ingredients: e.target.value })} className="w-full p-2 border border-border rounded-md bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Spice Level</label>
                <select value={formData.spice_level} onChange={e => setFormData({ ...formData, spice_level: e.target.value })} className="w-full p-2 border border-border rounded-md bg-background">
                  <option value="Mild">Mild</option>
                  <option value="Medium">Medium</option>
                  <option value="Hot">Hot</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 border border-border rounded-md bg-background text-sm"
                />
                {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                {formData.image_url && !uploading && (
                  <div className="relative w-24 h-24 rounded-md overflow-hidden border border-border mt-2">
                    <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="isVeg" checked={formData.is_veg} onChange={e => setFormData({ ...formData, is_veg: e.target.checked })} className="w-4 h-4 rounded border-border" />
                <label htmlFor="isVeg" className="text-sm font-medium">100% Vegetarian</label>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-lg font-bold">Variants</h3>
                <button type="button" onClick={addVariant} className="text-sm text-primary flex items-center font-medium hover:underline">
                  <Plus className="h-4 w-4 mr-1" /> Add Variant
                </button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, idx) => (
                  <div key={idx} className="flex gap-4 items-end p-4 border border-border rounded-lg bg-muted/10 relative group">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase">Weight/Size</label>
                      <input required type="text" placeholder="e.g. 250g" value={variant.weight} onChange={e => updateVariant(idx, 'weight', e.target.value)} className="w-full p-2 border border-border rounded-md bg-background" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase">Price (₹)</label>
                      <input required type="number" min="0" value={variant.price || ''} onChange={e => updateVariant(idx, 'price', Number(e.target.value))} className="w-full p-2 border border-border rounded-md bg-background" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase">Stock</label>
                      <input required type="number" min="0" value={variant.stock_quantity || ''} onChange={e => updateVariant(idx, 'stock_quantity', Number(e.target.value))} className="w-full p-2 border border-border rounded-md bg-background" />
                    </div>
                    {variants.length > 1 && (
                      <button type="button" onClick={() => removeVariant(idx)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-md border border-transparent hover:border-red-100 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-6 flex justify-end gap-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2 border border-border rounded-md font-medium hover:bg-muted transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 bg-primary text-white rounded-md font-medium shadow hover:bg-primary/90 transition-colors">
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl font-serif font-bold text-foreground">Products</h1>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-background text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-sm border-b border-border">
                <th className="p-4 font-medium w-16">Image</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Base Price</th>
                <th className="p-4 font-medium">Variants</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border/50 text-sm hover:bg-muted/30 group">
                    <td className="p-4">
                      <div className="w-12 h-12 relative rounded-md overflow-hidden bg-muted border border-border">
                        <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground">{product.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-secondary/20 text-secondary-foreground text-xs rounded-full font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">₹{product.variants[0]?.price || 0}</td>
                    <td className="p-4 text-muted-foreground">
                      {product.variants.length} ({product.variants.map(v => v.weight).join(', ')})
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this product?")) {
                              const success = await deleteProduct(product.id);
                              if (!success) {
                                alert("Something went wrong deleting the product. Please try again.");
                              }
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
