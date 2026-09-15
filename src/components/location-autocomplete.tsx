"use client";

import { LoaderCircle, MapPin } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

import { searchLocations } from "@/lib/api";
import type { LocationSuggestion } from "@/lib/types";

type LocationAutocompleteProps = {
  className?: string;
  icon: ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

const inputShellClass =
  "flex min-h-12 items-center gap-2.5 rounded-xl border border-field-border bg-white px-3.5 text-muted transition focus-within:border-orange focus-within:ring-3 focus-within:ring-orange/10";

export const LocationAutocomplete = ({
  className = "",
  icon,
  label,
  placeholder,
  value,
  onChange,
}: LocationAutocompleteProps) => {
  const listId = useId();
  const selectedValue = useRef("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2 || query === selectedValue.current) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchLocations(query, controller.signal);
        if (!controller.signal.aborted) {
          setSuggestions(results);
          setHasSearched(true);
          setIsOpen(true);
          setActiveIndex(-1);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setHasSearched(true);
          setIsOpen(true);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [value]);

  const handleChange = (nextValue: string) => {
    selectedValue.current = "";
    onChange(nextValue);
    setIsOpen(nextValue.trim().length >= 2);
    setHasSearched(false);
    if (nextValue.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    selectedValue.current = suggestion.label;
    onChange(suggestion.label);
    setSuggestions([]);
    setIsOpen(false);
    setIsLoading(false);
    setHasSearched(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <label className="relative mt-4 block">
      <span className="mb-2 block text-xs font-bold text-field-text">{label}</span>
      <div className={`${inputShellClass} ${className}`}>
        {icon}
        <input
          className="w-full min-w-0 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted-light"
          required
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          autoComplete="off"
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.trim().length >= 2 && setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          placeholder={placeholder}
        />
        {isLoading && <LoaderCircle className="size-4 shrink-0 animate-spin text-orange" />}
      </div>

      {isOpen && (suggestions.length > 0 || (hasSearched && !isLoading)) && (
        <div
          className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-field-border bg-white shadow-menu"
          id={listId}
          role="listbox"
        >
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                id={`${listId}-option-${index}`}
                className={`flex w-full cursor-pointer items-start gap-2 border-0 border-b border-line-soft px-3 py-2.5 text-left text-xs leading-5 last:border-b-0 hover:bg-surface-soft hover:text-forest ${
                  index === activeIndex ? "bg-surface-soft text-forest" : "bg-white text-ink"
                }`}
                key={`${suggestion.label}-${suggestion.longitude}-${suggestion.latitude}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-orange" />
                <span>{suggestion.label}</span>
              </button>
            ))
          ) : (
            <p className="m-0 p-3 text-xs text-muted">No US locations found.</p>
          )}
        </div>
      )}
    </label>
  );
};
