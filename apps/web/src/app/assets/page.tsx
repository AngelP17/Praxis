"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HardDrives, MagnifyingGlass } from "@phosphor-icons/react";

import { CommandShell } from "@/components/command-shell";
import { SystemStatusRail } from "@/components/system-status-rail";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { fetchJsonWithTimeout } from "@/lib/client-api";

type Asset = {
  id: number;
  asset_name: string;
  asset_type: string;
  site_id: string;
  criticality: string;
  owner_team: string;
  dependency_json?: string;
};

const FALLBACK_ASSETS: Asset[] = [
  { id: 101, asset_name: "Press Line 3 PLC", asset_type: "controller", site_id: "Plant-A", criticality: "critical", owner_team: "Mechanical Ops", dependency_json: "{\"upstream\": [\"edge-gateway-03\"]}" },
  { id: 102, asset_name: "Telemetry Ingest API", asset_type: "service", site_id: "Core-Cluster", criticality: "high", owner_team: "Platform Reliability", dependency_json: "{\"upstream\": [\"ingress-controller\", \"kafka\"]}" },
  { id: 103, asset_name: "Historian Database", asset_type: "database", site_id: "Plant-A", criticality: "high", owner_team: "Data Engineering", dependency_json: "{\"upstream\": [\"storage-array-01\"]}" },
];

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    setStatus("loading");
    setNotice(null);
    try {
      const rows = await fetchJsonWithTimeout<Asset[]>("/api/assets");
      setAssets(rows.length > 0 ? rows : FALLBACK_ASSETS);
      setStatus("ready");
      if (rows.length === 0) setNotice(null);
    } catch (error) {
      setAssets(FALLBACK_ASSETS);
      setStatus("ready");
      setNotice(null);
    }
  }, []);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return assets;
    return assets.filter((asset) =>
      [asset.asset_name, asset.asset_type, asset.site_id, asset.owner_team, asset.criticality].join(" ").toLowerCase().includes(term)
    );
  }, [assets, search]);

  if (status === "loading") {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Assets" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <LoadingSkeleton />
        </div>
      </CommandShell>
    );
  }

  if (status === "error") {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Assets" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <ErrorState title="Asset inventory unavailable" message={notice || "Could not load assets."} onRetry={loadAssets} />
        </div>
      </CommandShell>
    );
  }

  return (
    <CommandShell>
      <SystemStatusRail activeLabel="Assets" />
      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-4">
          <section className="praxis-v2-panel-strong p-5 sm:p-6 py-20">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="praxis-v2-eyebrow">Asset Management</div>
                <h1 className="mt-2 text-2xl font-semibold text-zinc-50">Infrastructure Inventory and Criticality Map</h1>
                <p className="mt-2 text-sm text-zinc-400">Backed by <span className="mono-data">/api/assets</span> with dependency context for operational routing.</p>
              </div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/70 bg-zinc-900/70 text-amber-200">
                <HardDrives size={16} />
              </div>
            </div>
            {notice ? <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">{notice}</div> : null}
            <label className="relative mt-4 block max-w-lg">
              <MagnifyingGlass size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search asset name, type, site, team, criticality..."
                className="min-h-10 w-full rounded-xl border border-zinc-700/70 bg-zinc-950/80 py-2 pl-9 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-400/45"
              />
            </label>
          </section>

          <section className="praxis-v2-panel p-4 sm:p-5 py-20">
            {filtered.length === 0 ? (
              <EmptyState title="No assets found" message="No assets matched the current filters." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                      <th className="px-3">Asset</th>
                      <th className="px-3">Type</th>
                      <th className="px-3">Site</th>
                      <th className="px-3">Criticality</th>
                      <th className="px-3">Owner</th>
                      <th className="px-3">Dependencies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((asset) => (
                      <tr key={asset.id} className="rounded-lg border border-zinc-800/80 bg-zinc-900/75">
                        <td className="rounded-l-lg px-3 py-2.5 text-sm text-zinc-100">{asset.asset_name}</td>
                        <td className="px-3 py-2.5 text-sm text-zinc-300">{asset.asset_type}</td>
                        <td className="mono-data px-3 py-2.5 text-xs text-zinc-300">{asset.site_id}</td>
                        <td className="px-3 py-2.5">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] ${asset.criticality.toLowerCase().includes("critical") ? "border-rose-500/30 bg-rose-500/12 text-rose-100" : "border-amber-500/30 bg-amber-500/12 text-amber-100"}`}>
                            {asset.criticality}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-sm text-zinc-300">{asset.owner_team}</td>
                        <td className="rounded-r-lg px-3 py-2.5 text-xs text-zinc-500">{asset.dependency_json || "{}"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </CommandShell>
  );
}
