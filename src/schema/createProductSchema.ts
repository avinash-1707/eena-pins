import z from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1),
    price: z.number().int().nonnegative(),
    imageUrl: z.string(),
    category: z.string().min(1),
    description: z.string().min(1),
    warrantyMonths: z.number().int().positive().optional(),
    freeShippingOn: z.boolean().optional(),
    returnAvailable: z.boolean().optional(),

    details: z
        .object({
            brand: z.string().optional(),
            material: z.string().optional(),
            keyFeatures: z.array(z.string()),
            moreOptions: z.record(z.string(), z.string()).optional(),
            rating: z.number().min(0).max(5).optional(),
        })
        .optional(),
});