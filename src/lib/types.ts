// Custom types for our e-commerce application

export interface Image {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  price: Money;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  images: Image[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  variants: ProductVariant[];
  options: ProductOption[];
  tags: string[];
  updatedAt: string;
  createdAt: string;
  featuredImage?: Image;
  seo?: {
    title: string;
    description: string;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: CartItem[];
  totalQuantity: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
    product: Product;
  };
}

export interface Collection {
  handle: string;
  title: string;
  description: string;
  seo: {
    title: string;
    description: string;
  };
  updatedAt: string;
  path: string;
}

export interface Menu {
  title: string;
  path: string;
  items: Menu[];
}

export interface Page {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: {
    title: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
}
