import React from "react";
import { notFound } from "next/navigation";
import ProductImageSection from "@/components/product/ProductImageSection";
import ProductInfo from "@/components/product/ProductInfo";
import ProductFeatures from "@/components/product/ProductFeatures";
import ProductOptions from "@/components/product/ProductOptions";
import ProductDetailsSection from "@/components/product/ProductDetailsSection";
import ReviewsSection from "@/components/product/ReviewSection";
import ProductActions from "@/components/product/ProductActions";
import Header from "@/components/layout/HomeHeader";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/Preduct";
import { Role } from "@/types/Role";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

function parseOptionArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map((x) => String(x).trim()).filter(Boolean);
  if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const row = await prisma.product.findUnique({
    where: { id },
    include: {
      details: true,
      ratings: {
        select: {
          id: true,
          rating: true,
          review: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
      brandProfile: {
        select: { id: true, brandName: true },
      },
    },
  });

  if (!row) {
    notFound();
  }

  const details = row.details;
  const moreOptions = (details?.moreOptions ?? null) as Record<string, unknown> | null;
  const colors = moreOptions
    ? parseOptionArray(moreOptions.colors ?? moreOptions.Color ?? moreOptions.color)
    : [];
  const sizes = moreOptions
    ? parseOptionArray(moreOptions.sizes ?? moreOptions.Size ?? moreOptions.size)
    : [];

  const productForActions: Product = {
    id: row.id,
    name: row.name,
    fullPrice: row.fullPrice,
    price: row.price,
    category: row.category,
    description: row.description,
    warrantyMonths: row.warrantyMonths ?? undefined,
    freeShippingOn: row.freeShippingOn,
    returnAvailable: row.returnAvailable,
    brandId: row.brandProfileId,
    brand: row.brandProfile
      ? {
          id: row.brandProfile.id,
          username: row.brandProfile.brandName,
          name: row.brandProfile.brandName,
          avatarUrl: null,
          email: "",
          description: "",
          role: Role.BRAND,
          createdAt: new Date(),
        }
      : undefined,
    createdAt: row.createdAt,
  };

  const avgRating =
    row.ratings.length > 0
      ? row.ratings.reduce((sum, r) => sum + r.rating, 0) / row.ratings.length
      : details?.rating ?? 0;

  const reviews = row.ratings.map((r) => ({
    id: r.id,
    rating: r.rating,
    review: r.review ?? null,
    createdAt: r.createdAt.toISOString(),
    user: {
      name: r.user?.name ?? null,
      username: r.user?.username ?? "",
      avatarUrl: r.user?.avatarUrl ?? null,
    },
  }));

  return (
    <div className="min-h-screen dotted-background">
      <Header />

      <main className="pt-16 pb-24">
        <ProductImageSection
          imageUrl={row.imageUrl}
          category={row.category}
          rating={typeof avgRating === "number" ? avgRating : 0}
        />

        <ProductInfo
          name={row.name}
          fullPrice={row.fullPrice}
          price={row.price}
          description={row.description}
          rating={typeof avgRating === "number" ? avgRating : 0}
          totalReviews={reviews.length}
        />

        {(colors.length > 0 || sizes.length > 0) && (
          <ProductOptions colors={colors} sizes={sizes} />
        )}

        <ProductActions product={productForActions} />

        <ProductFeatures
          freeShipping={row.freeShippingOn}
          warrantyMonths={row.warrantyMonths}
          returnAvailable={row.returnAvailable}
        />

        {details && (
          <ProductDetailsSection
            brand={details.brand}
            material={details.material}
            keyFeatures={details.keyFeatures ?? []}
            moreOptions={moreOptions as Record<string, string> | null}
          />
        )}

        <ReviewsSection reviews={reviews} />
      </main>
    </div>
  );
}
