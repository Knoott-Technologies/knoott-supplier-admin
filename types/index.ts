// Update the ProcessedProduct interface to match the database schema

export interface RawProductData {
  [key: string]: any;
  name?: string;
  description?: string;
  brand?: string;
  image_url?: string;
  sku?: string;
  price?: string | number;

  // Shopify specific fields
  Title?: string;
  Description?: string;
  Vendor?: string;
  "Image Src"?: string;
  SKU?: string;
  "Variant Price"?: string | number;
}

export interface ProcessedProduct {
  name: string;
  short_name: string;
  description: string;
  short_description: string;
  brand_id: number | null;
  brand_name?: string; // For display purposes
  dimensions: any | null; // Can be null as per DB schema
  specs: any | null; // Can be null as per DB schema
  keywords: string[]; // Default to empty array if null
  images_url: string[];
  subcategory_id: number;
  subcategory_name?: string; // For display purposes
  presence_in_gifts: number;
  status: "active" | "archived" | "draft" | "requires_verification" | "deleted";
  shipping_cost: number;
  provider_business_id?: string | null; // Will be set in the save route
  variants: ProductVariant[];
}

export interface ProductVariant {
  name: string;
  display_name: string;
  position: number;
  options: ProductVariantOption[];
}

export interface ProductVariantOption {
  name: string;
  display_name: string;
  price: number | null;
  accorded_commision: number;
  stock: number | null;
  position: number;
  is_default: boolean;
  metadata: any | null;
  sku: string | null;
  images_url: string[] | null;
}

export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  children?: Category[];
}

export interface Brand {
  id: number;
  name: string;
}

export interface ImportState {
  products: RawProductData[];
  processedProducts: ProcessedProduct[];
  isLoading: boolean;
  categories: Category[];
  brands: Brand[];
  businessId: string;
}
