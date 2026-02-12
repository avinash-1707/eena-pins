import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import BottomNav from "@/components/layout/BottomNav";
import HomeHeader from "@/components/layout/HomeHeader";
import ProductGrid from "@/components/home/ProductGrid";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CollectionPageProps {
  params: Promise<{ collectionId: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collectionId } = await params;
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ?? null;

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: {
      id: true,
      name: true,
      isPublic: true,
      userId: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
      products: {
        orderBy: [{ createdAt: "desc" }],
        select: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  if (!collection) {
    notFound();
  }

  if (!collection.isPublic && collection.userId !== viewerId) {
    notFound();
  }

  const products = collection.products.map((entry) => ({
    id: entry.product.id,
    name: entry.product.name,
    category: entry.product.category,
    imageUrl: entry.product.imageUrl,
  }));

  const ownerName = collection.user.name?.trim() || collection.user.username;

  return (
    <div className="min-h-screen dotted-background">
      <HomeHeader />

      <main className="pb-20 pt-16">
        <section className="px-4 py-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Collection by <Link className="font-semibold text-gray-700" href={`/profile/${collection.user.id}`}>@{collection.user.username}</Link>
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{collection.name}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {products.length} saved item{products.length === 1 ? "" : "s"} by {ownerName}
          </p>
        </section>

        {products.length === 0 ? (
          <div className="px-4 py-8 text-sm text-gray-600">This collection is empty.</div>
        ) : (
          <ProductGrid products={products} />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
