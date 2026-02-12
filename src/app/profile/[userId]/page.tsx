import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { Globe, Lock } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { prisma } from "@/lib/prisma";

interface UserProfilePageProps {
  params: Promise<{ userId: string }>;
}

function getInitials(name: string | null, username: string): string {
  const source = name?.trim() || username;
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      description: true,
      createdAt: true,
      collections: {
        where: viewerId === userId ? {} : { isPublic: true },
        orderBy: [{ createdAt: "desc" }],
        include: {
          _count: {
            select: { products: true },
          },
          products: {
            orderBy: [{ createdAt: "desc" }],
            take: 4,
            select: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const displayName = user.name?.trim() || user.username;
  const initials = getInitials(user.name, user.username);

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-md px-4 pb-24 pt-8">
        <header className="text-center">
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-purple-100 shadow-lg ring-2 ring-purple-200">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={displayName}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-purple-600">
                {initials}
              </div>
            )}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{displayName}</h1>
          <p className="mt-1 text-sm text-gray-500">@{user.username}</p>
          {user.description && (
            <p className="mt-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
              {user.description}
            </p>
          )}
        </header>

        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Collections</h2>

          {user.collections.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">
              {viewerId === user.id
                ? "You have not created any collections yet."
                : "No public collections available."}
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {user.collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  className="block rounded-xl border border-gray-200 p-3"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{collection.name}</p>
                      <p className="text-xs text-gray-500">
                        {collection._count.products} saved items
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {collection.isPublic ? (
                        <Globe className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      {collection.isPublic ? "Public" : "Private"}
                    </span>
                  </div>

                  {collection.products.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 px-3 py-4 text-xs text-gray-500">
                      Empty collection
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {collection.products.map((entry) => (
                        <div
                          key={entry.product.id}
                          className="relative block aspect-square overflow-hidden rounded-lg bg-gray-100"
                        >
                          <Image
                            src={entry.product.imageUrl}
                            alt={entry.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
