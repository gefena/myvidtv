"use client";

import { useState } from "react";
import { PREDEFINED_TAGS } from "@/lib/constants";

type TagPickerProps = {
  selected: string[];
  customTags: string[];
  onChange: (tags: string[]) => void;
};

export function TagPicker({ selected, customTags, onChange }: TagPickerProps) {
  const [input, setInput] = useState("");

  const allAvailable = [
    ...PREDEFINED_TAGS,
    ...customTags.filter((t) => !PREDEFINED_TAGS.includes(t as (typeof PREDEFINED_TAGS)[number])),
  ];

  const toggle = (tag: string) => {
    onChange(
      selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]
    );
  };

  const addCustom = () => {
    const tag = input.trim().toLowerCase().slice(0, 32);
    if (!tag || selected.includes(tag)) return;
    onChange([...selected, tag]);
    setInput("");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginBottom: "10px",
        }}
      >
        {allAvailable.map((tag) => {
          const active = selected.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggle(tag)}
              style={{
                background: active ? "var(--violet)" : "var(--surface-2)",
                border: `1px solid ${active ? "var(--violet)" : "var(--border)"}`,
                borderRadius: "20px",
                color: active ? "#fff" : "var(--text-muted)",
                cursor: "pointer",
                fontSize: "12px",
                padding: "4px 10px",
                transition: "all 0.15s",
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
          placeholder="Add custom tag..."
          style={{
            flex: 1,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--text)",
            fontSize: "13px",
            outline: "none",
            padding: "6px 10px",
          }}
        />
        <button
          onClick={addCustom}
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "13px",
            padding: "6px 12px",
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
