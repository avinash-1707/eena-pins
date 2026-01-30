import { CollectionProduct } from "./CollectionProduct";
import { ProductDetail } from "./ProductDetail";
import { User } from "./User";
import { UserRating } from "./UserRating";

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    warrantyMonths?: number | null;
    freeShippingOn: boolean;
    returnAvailable: boolean;

    // Brand ownership
    brandId: string;
    brand?: User;

    createdAt: Date;

    // Relations
    details?: ProductDetail | null;
    ratings?: UserRating[];
    collections?: CollectionProduct[];
}
