"use client";

import Image from "next/image";
import { Globe, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PreviewProduct {
  id: string;
  name: string;
  imageUrl: string;
}

interface ProfileCollection {
  id: string;
  name: string;
  isPublic: boolean;
  productCount: number;
  previewProducts: PreviewProduct[];
}

interface ProfileCollectionsProps {
  userId: string;
  title?: string;
  emptyMessage?: string;
}

export default function ProfileCollections({
  userId,
  title = "Collections",
  emptyMessage = "No collections yet.",
}: ProfileCollectionsProps) {
  const router = useRouter();
  const [collections, setCollections] = useState<ProfileCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingCollectionId, setUpdatingCollectionId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const loadCollections = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/users/${userId}/collections`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message ?? "Failed to load collections");
        }

        if (!cancelled) {
          setCollections(Array.isArray(data.data) ? data.data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCollections();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleVisibilityChange = async (
    collectionId: string,
    visibilityValue: "public" | "private"
  ) => {
    const isPublic = visibilityValue === "public";

    setUpdatingCollectionId(collectionId);
    setError(null);

    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message ?? "Failed to update visibility");
      }

      setCollections((prev) =>
        prev.map((collection) =>
          collection.id === collectionId ? { ...collection, isPublic } : collection
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUpdatingCollectionId(null);
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : collections.length === 0 ? (
        <p className="mt-3 text-sm text-gray-600">{emptyMessage}</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="cursor-pointer rounded-xl border border-gray-200 p-3"
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/collections/${collection.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(`/collections/${collection.id}`);
                }
              }}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{collection.name}</p>
                  <p className="text-xs text-gray-500">
                    {collection.productCount} saved items
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {updatingCollectionId === collection.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />
                  ) : collection.isPublic ? (
                    <Globe className="h-3.5 w-3.5 text-gray-500" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-gray-500" />
                  )}
                  <select
                    value={collection.isPublic ? "public" : "private"}
                    onChange={(e) =>
                      handleVisibilityChange(
                        collection.id,
                        e.target.value as "public" | "private"
                      )
                    }
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    disabled={updatingCollectionId === collection.id}
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-60"
                    aria-label={`Visibility for ${collection.name}`}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              {collection.previewProducts.length === 0 ? (
                <div className="rounded-lg bg-gray-50 px-3 py-4 text-xs text-gray-500">
                  Empty collection
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {collection.previewProducts.map((product) => (
                    <div
                      key={product.id}
                      className="relative block aspect-square overflow-hidden rounded-lg bg-gray-100"
                    >
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
