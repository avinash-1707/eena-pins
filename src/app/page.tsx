"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import HomeHeader from "@/components/layout/HomeHeader";
import CategoryTabs from "@/components/layout/CategoryTabs";
import BottomNav from "@/components/layout/BottomNav";
import ProductGrid from "@/components/home/ProductGrid";

interface ApiProduct {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

const PAGE_SIZE = 12;

function Home() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(
    async (cursor: string | null, append: boolean) => {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      if (cursor) params.set("cursor", cursor);
      if (activeCategory && activeCategory !== "All")
        params.set("category", activeCategory);
      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message ?? "Failed to load products");
      }
      const list = json.data ?? [];
      const next = json.nextCursor ?? null;
      const more = json.hasMore ?? false;
      if (append) {
        setProducts((prev) => [...prev, ...list]);
      } else {
        setProducts(list);
      }
      setNextCursor(next);
      setHasMore(more);
      if (!append && list.length > 0) {
        const cats = Array.from(
          new Set(["All", ...list.map((p: ApiProduct) => p.category).filter(Boolean)])
        );
        setCategories(cats);
      }
      return list;
    },
    [activeCategory]
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadPage(null, false)
      .catch((e) => setError(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  useEffect(() => {
    if (!hasMore || loadingMore || !nextCursor) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setLoadingMore(true);
        loadPage(nextCursor, true)
          .finally(() => setLoadingMore(false));
      },
      { rootMargin: "200px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, nextCursor, loadPage]);

  const displayProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    imageUrl: p.imageUrl,
  }));

  return (
    <div className="min-h-screen dotted-background">
      <HomeHeader />
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => setActiveCategory(cat)}
      />

      <main className="pt-14 pb-20">
        {error && (
          <div className="px-4 py-6 text-center text-sm text-red-600">
            {error}
          </div>
        )}
        {loading ? (
          <div className="px-4 py-12 text-center text-gray-500">
            Loading…
          </div>
        ) : (
          <>
            <ProductGrid products={displayProducts} />
            <div ref={sentinelRef} className="h-4" aria-hidden />
            {loadingMore && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                Loading more…
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default Home;
