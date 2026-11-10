"use client";

// Product filters kept in the page's URL, so a filtered list can be shared or bookmarked.
// Read once the page has loaded (the page itself is built without them), and written back with
// replaceState so filtering doesn't fill the browser history.
import { useCallback, useEffect, useState } from "react";
import { NO_FILTERS, filtersQuery, parseFilters, type ProductFilters } from "@/lib/product-filters";
import { trackEvent } from "@/components/Analytics";

const OWN_KEYS = ["tested", "nocaffeine", "diet", "maxprice", "mincarbs", "sort"];

export function useUrlFilters(page: string): [ProductFilters, (f: ProductFilters) => void] {
  const [filters, setFilters] = useState<ProductFilters>(NO_FILTERS);

  useEffect(() => {
    setFilters(parseFilters(new URLSearchParams(window.location.search)));
  }, []);

  const update = useCallback((f: ProductFilters) => {
    setFilters(f);
    const q = new URLSearchParams(window.location.search);
    for (const k of OWN_KEYS) q.delete(k);
    new URLSearchParams(filtersQuery(f)).forEach((v, k) => q.append(k, v));
    const s = q.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${s ? `?${s}` : ""}${window.location.hash}`);
    trackEvent("filter_use", { page, filters: filtersQuery(f) || "none" });
  }, [page]);

  return [filters, update];
}
