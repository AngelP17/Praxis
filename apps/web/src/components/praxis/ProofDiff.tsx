"use client";

import { useState } from "react";
import { ArrowsLeftRight, Upload, BracketsCurly, X, Check } from "@phosphor-icons/react";

interface DiffLine {
  path: string;
  left: string;
  right: string;
  changed: boolean;
}

function compareObjects(a: unknown, b: unknown, prefix = ""): DiffLine[] {
  if (a === b) return [{ path: prefix, left: JSON.stringify(a), right: JSON.stringify(b), changed: false }];
  if (a === undefined || b === undefined)
    return [{ path: prefix, left: JSON.stringify(a), right: JSON.stringify(b), changed: true }];
  if (typeof a !== typeof b)
    return [{ path: prefix, left: JSON.stringify(a), right: JSON.stringify(b), changed: true }];

  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLen = Math.max(a.length, b.length);
    const results: DiffLine[] = [];
    for (let i = 0; i < maxLen; i++) {
      results.push(...compareObjects(a[i], b[i], `${prefix}[${i}]`));
    }
    return results;
  }

  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);
    const results: DiffLine[] = [];
    for (const key of allKeys) {
      results.push(...compareObjects(aObj[key], bObj[key], prefix ? `${prefix}.${key}` : key));
    }
    return results;
  }

  return [{ path: prefix, left: JSON.stringify(a), right: JSON.stringify(b), changed: a !== b }];
}

export function ProofDiff() {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [diffs, setDiffs] = useState<DiffLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ total: number; changed: number }>({ total: 0, changed: 0 });

  const handleCompare = () => {
    setError(null);
    try {
      const left = JSON.parse(leftText);
      const right = JSON.parse(rightText);
      if (left.proof_hash && right.proof_hash && left.proof_hash === right.proof_hash) {
        setDiffs([]);
        setSummary({ total: 0, changed: 0 });
        return;
      }
      const results = compareObjects(left, right);
      setDiffs(results.filter((d) => d.changed));
      setSummary({ total: results.length, changed: results.filter((d) => d.changed).length });
    } catch (e) {
      setError("Invalid JSON in one or both inputs");
    }
  };

  const handlePasteLeft = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLeftText(text);
    } catch {}
  };

  const handlePasteRight = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRightText(text);
    } catch {}
  };

  return (
    <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
        <ArrowsLeftRight className="h-4 w-4 text-[var(--praxis-violet)]" />
        Proof Object Diff
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Proof A</span>
            <button
              onClick={handlePasteLeft}
              className="flex items-center gap-1 border border-[var(--praxis-line)] px-2 py-1 font-mono text-[10px] uppercase text-[var(--praxis-muted)] transition-all duration-700 hover:scale-105"
            >
              <Upload className="h-3 w-3" /> Paste
            </button>
          </div>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="Paste proof JSON here…"
            className="w-full h-48 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-3 font-mono text-xs text-[var(--praxis-muted)] resize-y focus:outline-none focus:border-[var(--praxis-violet)]"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Proof B</span>
            <button
              onClick={handlePasteRight}
              className="flex items-center gap-1 border border-[var(--praxis-line)] px-2 py-1 font-mono text-[10px] uppercase text-[var(--praxis-muted)] transition-all duration-700 hover:scale-105"
            >
              <Upload className="h-3 w-3" /> Paste
            </button>
          </div>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="Paste proof JSON here…"
            className="w-full h-48 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-3 font-mono text-xs text-[var(--praxis-muted)] resize-y focus:outline-none focus:border-[var(--praxis-violet)]"
          />
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={!leftText || !rightText}
        className="mt-4 flex items-center gap-2 bg-[var(--praxis-violet)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-bg)] transition-transform duration-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowsLeftRight className="h-3 w-3" /> Compare Proofs
      </button>

      {error && (
        <div className="mt-4 border border-[var(--praxis-crit)] p-3 font-mono text-[10px] uppercase text-[var(--praxis-crit)]">
          {error}
        </div>
      )}

      {diffs.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            {summary.changed} fields differ
          </div>
          <div className="max-h-96 overflow-auto border border-[var(--praxis-line)] bg-[var(--praxis-bg)]">
            {diffs.map((diff) => (
              <div key={diff.path} className="border-b border-[var(--praxis-line)] p-3">
                <div className="font-mono text-[10px] uppercase text-[var(--praxis-violet)]">{diff.path}</div>
                <div className="mt-1 grid grid-cols-2 gap-4">
                  <div className="break-all font-mono text-[10px] text-[var(--praxis-crit)]">
                    <X className="inline h-3 w-3 mr-1" />
                    {diff.left || "(missing)"}
                  </div>
                  <div className="break-all font-mono text-[10px] text-[var(--praxis-mint)]">
                    <Check className="inline h-3 w-3 mr-1" />
                    {diff.right || "(missing)"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {diffs.length === 0 && leftText && rightText && !error && (
        <div className="mt-6 border border-[var(--praxis-mint)] bg-[rgba(62,255,168,0.04)] p-4 text-center">
          <Check className="mx-auto h-6 w-6 text-[var(--praxis-mint)]" />
          <p className="mt-2 font-mono text-[10px] uppercase text-[var(--praxis-mint)]">
            Proofs are identical — deterministic replay confirmed
          </p>
        </div>
      )}
    </article>
  );
}
