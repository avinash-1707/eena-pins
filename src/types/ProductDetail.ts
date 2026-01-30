import { Product } from "./Preduct";

export interface ProductDetail {
    id: string;
    productId: string;

    brand?: string | null;
    material?: string | null;
    keyFeatures: string[];
    moreOptions?: Record<string, any> | null;
    rating?: number | null;

    product?: Product;
}
