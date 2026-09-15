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

export function LocationAutocomplete({
  className = "",
  icon,
  label,
  placeholder,
  value,
  onChange,
}: LocationAutocompleteProps) {
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

  function handleChange(nextValue: string) {
    selectedValue.current = "";
    onChange(nextValue);
    setIsOpen(nextValue.trim().length >= 2);
    setHasSearched(false);
    if (nextValue.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
    }
  }

  function selectSuggestion(suggestion: LocationSuggestion) {
    selectedValue.current = suggestion.label;
    onChange(suggestion.label);
    setSuggestions([]);
    setIsOpen(false);
    setIsLoading(false);
    setHasSearched(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
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
  }

  return (
    <label className="autocomplete-field">
      <span>{label}</span>
      <div className={`input-shell ${className}`}>
        {icon}
        <input
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
        {isLoading && <LoaderCircle className="autocomplete-spinner size-4" />}
      </div>

      {isOpen && (suggestions.length > 0 || (hasSearched && !isLoading)) && (
        <div className="suggestions" id={listId} role="listbox">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                id={`${listId}-option-${index}`}
                className={index === activeIndex ? "suggestion active" : "suggestion"}
                key={`${suggestion.label}-${suggestion.longitude}-${suggestion.latitude}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
              >
                <MapPin className="size-4" />
                <span>{suggestion.label}</span>
              </button>
            ))
          ) : (
            <p className="no-suggestions">No US locations found.</p>
          )}
        </div>
      )}
    </label>
  );
}
