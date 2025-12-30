"use client";

import { useState, useEffect } from "react";
import { IndianRupee, X } from "lucide-react";
import {
  pricePresets,
  formatPriceIndian,
  parseIndianNotation,
} from "@/lib/utils";

interface PriceRangeInputProps {
  minPrice: string;
  maxPrice: string;
  onChange: (values: { min: string; max: string }) => void;
  error?: string;
}

export default function PriceRangeInput({
  minPrice,
  maxPrice,
  onChange,
  error,
}: PriceRangeInputProps) {
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");

  // Sync inputs when external values change (and inputs are empty/not matching)
  useEffect(() => {
    if (minPrice && !minInput) {
      // Don't auto-fill input if it's already being typed in,
      // but here we might want to just leave it blank or show the formatted value?
      // The original user form logic used `minPriceInput` state.
      // Let's keep it simple: input shows value if set, unless user is typing.
      // Actually, standard controlled input pattern is better.
    }
  }, [minPrice, maxPrice]);

  const handleMinChange = (val: string) => {
    setMinInput(val);
  };

  const handleMaxChange = (val: string) => {
    setMaxInput(val);
  };

  const handleMinBlur = () => {
    const parsed = parseIndianNotation(minInput);
    if (parsed) {
      onChange({ min: parsed, max: maxPrice });
      setMinInput("");
    } else if (!minInput) {
      onChange({ min: "", max: maxPrice });
    }
  };

  const handleMaxBlur = () => {
    const parsed = parseIndianNotation(maxInput);
    if (parsed) {
      onChange({ min: minPrice, max: parsed });
      setMaxInput("");
    } else if (!maxInput) {
      onChange({ min: minPrice, max: "" });
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "min" | "max"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "min") handleMinBlur();
      else handleMaxBlur();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-[var(--foreground)]">
          Price Range (₹) *
        </label>
        {(minPrice || maxPrice) && (
          <div className="flex items-center gap-2 text-[var(--primary)] font-semibold text-lg">
            <IndianRupee className="w-5 h-5" />
            <span>
              {formatPriceIndian(minPrice)} - {formatPriceIndian(maxPrice)}
            </span>
            <button
              type="button"
              onClick={() => {
                onChange({ min: "", max: "" });
                setMinInput("");
                setMaxInput("");
              }}
              className="ml-2 p-1 rounded-full bg-[var(--gray-100)] hover:bg-red-100 text-[var(--gray-500)] hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Min Price Section */}
        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Min Price
          </label>
          <div className="flex flex-wrap gap-2">
            {pricePresets.map((preset) => (
              <button
                key={`min-${preset.value}`}
                type="button"
                className={`price-preset-btn ${
                  minPrice === preset.value ? "active" : ""
                }`}
                onClick={() => {
                  onChange({ min: preset.value, max: maxPrice });
                  setMinInput("");
                }}
                title={preset.fullLabel}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="price-input-wrapper">
            <span className="price-input-prefix">₹</span>
            <input
              type="text"
              className="price-input"
              placeholder="Min Price (e.g. 80L)"
              value={
                minInput ||
                (minPrice
                  ? formatPriceIndian(minPrice).replace("₹", "").trim()
                  : "")
              }
              onChange={(e) => handleMinChange(e.target.value)}
              onBlur={handleMinBlur}
              onKeyDown={(e) => handleKeyDown(e, "min")}
            />
          </div>
        </div>

        {/* Max Price Section */}
        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Max Price
          </label>
          <div className="flex flex-wrap gap-2">
            {pricePresets.map((preset) => (
              <button
                key={`max-${preset.value}`}
                type="button"
                className={`price-preset-btn ${
                  maxPrice === preset.value ? "active" : ""
                }`}
                onClick={() => {
                  onChange({ min: minPrice, max: preset.value });
                  setMaxInput("");
                }}
                title={preset.fullLabel}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="price-input-wrapper">
            <span className="price-input-prefix">₹</span>
            <input
              type="text"
              className="price-input"
              placeholder="Max Price (e.g. 1Cr)"
              value={
                maxInput ||
                (maxPrice
                  ? formatPriceIndian(maxPrice).replace("₹", "").trim()
                  : "")
              }
              onChange={(e) => handleMaxChange(e.target.value)}
              onBlur={handleMaxBlur}
              onKeyDown={(e) => handleKeyDown(e, "max")}
            />
          </div>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
