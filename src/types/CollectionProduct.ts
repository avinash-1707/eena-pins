import { Collection } from "./Collection";
import { Product } from "./Preduct";

export interface CollectionProduct {
    id: string;
    collectionId: string;
    productId: string;

    createdAt: Date;

    collection?: Collection;
    product?: Product;
}
