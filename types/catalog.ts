export type CatalogItemKind = "fish" | "apparel";

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  category: string;
  kind?: CatalogItemKind;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  badge?: string;
}

export interface CartSelection {
  itemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  size?: string;
  color?: string;
}
