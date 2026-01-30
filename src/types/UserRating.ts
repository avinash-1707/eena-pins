import { Product } from "./Preduct";
import { User } from "./User";

export interface UserRating {
    id: string;
    userId: string;
    productId: string;

    rating: number;
    review?: string | null;
    createdAt: Date;

    user?: User;
    product?: Product;
}
