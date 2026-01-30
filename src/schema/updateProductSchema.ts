import z from "zod";

export const updateProductSchema = z.object({
    name: z.string().min(1).optional(),
    price: z.number().int().nonnegative().optional(),
    imageUrl: z.string(),
    category: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    warrantyMonths: z.number().int().positive().optional(),
    freeShippingOn: z.boolean().optional(),
    returnAvailable: z.boolean().optional(),

    details: z
        .object({
            brand: z.string().optional(),
            material: z.string().optional(),
            keyFeatures: z.array(z.string()).optional(),
            moreOptions: z.record(z.string(), z.string()).optional(),
            rating: z.number().min(0).max(5).optional(),
        })
        .optional(),
});