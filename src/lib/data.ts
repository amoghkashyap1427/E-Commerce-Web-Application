export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  ingredients: string;
  spice_level: "Mild" | "Medium" | "Hot";
  is_veg: boolean;
  image_url: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  weight: string;
  price: number;
  stock_quantity: number;
}

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Classic Mango Pickle",
    description: "Our signature 'Aam Ka Achaar' made with handpicked raw green mangoes, sun-dried, and infused with traditional spices and pure mustard oil. Exactly how Dadi used to make it.",
    category: "Mango",
    ingredients: "Raw Mango, Mustard Oil, Fenugreek, Fennel, Nigella Seeds, Turmeric, Red Chilli Powder, Salt.",
    spice_level: "Medium",
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1627308595171-d1b5d672158e?auto=format&fit=crop&q=80&w=600",
    variants: [
      { id: "v1_250", weight: "250g", price: 299, stock_quantity: 50 },
      { id: "v1_500", weight: "500g", price: 549, stock_quantity: 100 },
      { id: "v1_1000", weight: "1kg", price: 999, stock_quantity: 30 }
    ]
  },
  {
    id: "p2",
    name: "Spicy Garlic Pickle",
    description: "A pungent and fiery delight. Whole garlic cloves matured in aromatic spices and oil. Perfect companion for simple dal chawal or stuffed parathas.",
    category: "Garlic",
    ingredients: "Garlic Cloves, Mustard Oil, Red Chilli Powder, Turmeric, Asafoetida, Salt, Lemon Juice.",
    spice_level: "Hot",
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1596484552834-6a58f850b0a1?auto=format&fit=crop&q=80&w=600",
    variants: [
      { id: "v2_250", weight: "250g", price: 349, stock_quantity: 40 },
      { id: "v2_500", weight: "500g", price: 649, stock_quantity: 60 }
    ]
  },
  {
    id: "p3",
    name: "Khatta Meetha Nimbu (Sweet Lemon)",
    description: "Aged for months without a drop of oil! This sweet and sour lemon pickle is excellent for digestion and loved by kids and adults alike.",
    category: "Lemon",
    ingredients: "Lemons, Sugar, Cumin, Black Salt, Carom Seeds (Ajwain).",
    spice_level: "Mild",
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=600",
    variants: [
      { id: "v3_250", weight: "250g", price: 299, stock_quantity: 70 },
      { id: "v3_500", weight: "500g", price: 549, stock_quantity: 120 }
    ]
  },
  {
    id: "p4",
    name: "Choudharyji's Signature Sample Pack",
    description: "Can't decide? Try our top 4 flavors in convenient mini-jars. The perfect way to start your pickle journey or gift to a loved one.",
    category: "Sample Packs",
    ingredients: "Contains Mango, Garlic, Lemon, and Mixed Pickles.",
    spice_level: "Medium",
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1596649299486-4cdea56fd59d?auto=format&fit=crop&q=80&w=600",
    variants: [
      { id: "v4_pack", weight: "4 x 100g", price: 499, stock_quantity: 150 }
    ]
  }
];
