import { Collection } from "./Collection";
import { Product } from "./Preduct";
import { Role } from "./Role";
import { UserRating } from "./UserRating";

export interface User {
    id: string;
    email: string;
    username: string;
    description: string;
    name?: string | null;
    avatarUrl?: string | null;
    provider?: string | null;
    providerAccountId?: string | null;

    role: Role;
    createdAt: Date;

    // Relations
    ratings?: UserRating[];
    collections?: Collection[];
    products?: Product[]; // only for BRAND users
    creatorProfile?: unknown;
    creatorRequest?: unknown;
}
