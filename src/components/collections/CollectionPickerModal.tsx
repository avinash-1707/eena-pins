"use client";

import { Loader2, Lock, Pin, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

interface CollectionItem {
  id: string;
  name: string;
  isPublic: boolean;
  productCount: number;
  containsProduct: boolean;
}

interface CollectionPickerModalProps {
  open: boolean;
  productId: string | null;
  onClose: () => void;
  onPinned?: () => void;
}

export default function CollectionPickerModal({
  open,
  productId,
  onClose,
  onPinned,
}: CollectionPickerModalProps) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingCollectionId, setSavingCollectionId] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!open || !productId) return;

    let cancelled = false;

    const loadCollections = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/collections?productId=${encodeURIComponent(productId)}`
        );
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 401) {
            setError("Sign in to save products to collections.");
            return;
          }
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
  }, [open, productId]);

  if (!open || !productId) return null;

  const handleSaveToCollection = async (collectionId: string) => {
    if (!productId) return;

    setSavingCollectionId(collectionId);
    setError(null);

    try {
      const res = await fetch(`/api/collections/${collectionId}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message ?? "Failed to add product to collection");
      }

      setCollections((prev) =>
        prev.map((collection) =>
          collection.id === collectionId
            ? {
                ...collection,
                containsProduct: true,
                productCount: collection.containsProduct
                  ? collection.productCount
                  : collection.productCount + 1,
              }
            : collection
        )
      );

      onPinned?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSavingCollectionId(null);
    }
  };

  const handleCreateCollection = async () => {
    const name = newCollectionName.trim();
    if (!name) return;

    setCreatingCollection(true);
    setError(null);

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, isPublic: true }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message ?? "Failed to create collection");
      }

      const createdCollection = data.collection as CollectionItem;
      if (!createdCollection?.id) {
        throw new Error("Collection created, but response was invalid");
      }

      setCollections((prev) => [createdCollection, ...prev]);
      setNewCollectionName("");
      setShowCreateForm(false);

      await handleSaveToCollection(createdCollection.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCreatingCollection(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center">
      <div className="w-full animate-in slide-in-from-bottom-5 rounded-t-2xl bg-white p-4 sm:m-auto sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Save to collection</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-3">
          {!showCreateForm ? (
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Create collection
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                maxLength={60}
              />
              <button
                type="button"
                onClick={handleCreateCollection}
                disabled={creatingCollection || !newCollectionName.trim()}
                className="inline-flex items-center rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {creatingCollection ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewCollectionName("");
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : collections.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
            No collections yet. Create one to save this product.
          </div>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {collections.map((collection) => {
              const isSaving = savingCollectionId === collection.id;
              return (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => handleSaveToCollection(collection.id)}
                  disabled={isSaving || collection.containsProduct}
                  className="w-full rounded-xl border border-gray-200 px-3 py-3 text-left hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-80"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{collection.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {collection.productCount} saved items
                      </p>
                    </div>

                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    ) : collection.containsProduct ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        <Pin className="h-3 w-3 fill-current" />
                        Saved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                        {collection.isPublic ? (
                          <Pin className="h-3 w-3" />
                        ) : (
                          <Lock className="h-3 w-3" />
                        )}
                        Save
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
