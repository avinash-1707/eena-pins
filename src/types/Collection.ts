import { CollectionProduct } from "./CollectionProduct";
import { User } from "./User";

export interface Collection {
    id: string;
    name: string;
    isPublic: boolean;

    userId: string;
    user?: User;

    createdAt: Date;

    products?: CollectionProduct[];
}
