// src/app/explore/page.js
// The Explore / Gallery feed: search + All/For sale pills + a vertical feed of
// full-bleed artwork cards at their real aspect ratios.
"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useT } from "../../i18n/index";
import { listArtworksPaged } from "../../api/artwork";
import ExploreCard from "../../components/ExploreCard";

export default function ExplorePage() {
  const { t } = useT();
  const [q, setQ] = useState("");
  const [forSale, setForSale] = useState(false);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["artworks", "explore", { q, forSale }],
    queryFn: ({ pageParam = 1 }) =>
      listArtworksPaged({
        page: pageParam,
        limit: 12,
        q: q || undefined,
        available: forSale || undefined,
        sort: "-createdAt",
      }),
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? (lastPage.page ?? 1) + 1 : undefined,
    initialPageParam: 1,
  });

  const items = data?.pages.flatMap((p) => p.data ?? []) ?? [];

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "clamp(16px, 4vw, 28px) clamp(14px, 4vw, 20px) 60px",
      }}
    >
      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: 16,
          padding: "13px 18px",
          marginBottom: 18,
          boxShadow: "var(--shadow)",
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: 18 }}>⌕</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchArtworksArtists")}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--text)",
            fontSize: 16,
          }}
        />
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
        <Pill active={!forSale} onClick={() => setForSale(false)}>
          {t("filterAll")}
        </Pill>
        <Pill active={forSale} onClick={() => setForSale(true)}>
          {t("forSale")}
        </Pill>
      </div>

      {isLoading ? (
        <p style={{ color: "var(--text-muted)" }}>{t("loading")}</p>
      ) : isError ? (
        <div>
          <p style={{ color: "var(--text-muted)" }}>{t("error")}</p>
          <button onClick={() => refetch()}>{t("retry")}</button>
        </div>
      ) : items.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>{t("noArtworks")}</p>
      ) : (
        <>
          <div>
            {items.map((a) => (
              <ExploreCard key={a._id} artwork={a} />
            ))}
          </div>

          {hasNextPage && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                style={{
                  padding: "11px 26px",
                  borderRadius: 10,
                  border: "1px solid var(--card-border)",
                  background: "transparent",
                  color: "var(--text)",
                  fontSize: 14,
                }}
              >
                {isFetchingNextPage ? t("loading") : t("loadMore")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 22px",
        borderRadius: 22,
        fontSize: 15,
        fontWeight: 600,
        border: active ? "none" : "1px solid var(--card-border)",
        background: active ? "var(--accent)" : "transparent",
        color: active ? "#fff" : "var(--text)",
      }}
    >
      {children}
    </button>
  );
}
