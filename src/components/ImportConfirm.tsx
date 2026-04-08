"use client";

import { useLibrary } from "@/hooks/useLibrary";
import type { LibraryData } from "@/types/library";

type ImportConfirmProps = {
  data: LibraryData | null;
  error: string | null;
  onReplace: () => void;
  onMerge: () => void;
  onDismiss: () => void;
  onRetry: () => void;
};

export function ImportConfirm({
  data,
  error,
  onReplace,
  onMerge,
  onDismiss,
  onRetry,
}: ImportConfirmProps) {
  const { importLibrary } = useLibrary();

  const handleReplace = () => {
    if (!data) return;
    importLibrary(data, "replace");
    onReplace();
  };

  const handleMerge = () => {
    if (!data) return;
    importLibrary(data, "merge");
    onMerge();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        padding: "20px",
      }}
      onClick={onDismiss}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "360px",
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {error ? (
          <>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>
              Import failed
            </div>
            <div style={{ fontSize: "13px", color: "#f87171", marginBottom: "20px" }}>
              {error}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={onRetry}
                style={{
                  flex: 1,
                  background: "var(--violet)",
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  padding: "8px 12px",
                }}
              >
                Try another file
              </button>
              <button
                onClick={onDismiss}
                style={{
                  flex: 1,
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "13px",
                  padding: "8px 12px",
                }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : data ? (
          <>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
              Import library
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
              {data.items.length} item{data.items.length !== 1 ? "s" : ""} found
              {data.archivedItems.length > 0 ? ` + ${data.archivedItems.length} archived` : ""}.
              How would you like to import?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                onClick={handleReplace}
                style={{
                  background: "var(--violet)",
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  padding: "10px 12px",
                  textAlign: "left",
                }}
              >
                Replace library
                <div style={{ fontSize: "11px", fontWeight: 400, opacity: 0.8, marginTop: "2px" }}>
                  Overwrites your current library entirely
                </div>
              </button>
              <button
                onClick={handleMerge}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  color: "var(--text)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  padding: "10px 12px",
                  textAlign: "left",
                }}
              >
                Merge — add new items
                <div style={{ fontSize: "11px", fontWeight: 400, color: "var(--text-muted)", marginTop: "2px" }}>
                  Keeps your existing library, adds items not already present
                </div>
              </button>
              <button
                onClick={onDismiss}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "6px",
                  marginTop: "2px",
                }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
