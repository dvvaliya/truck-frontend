"use client";

import { ArrowRight, LoaderCircle, MapPin, Navigation } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { CycleHoursInput } from "@/components/cycle-hours-input";
import { DateTimePicker } from "@/components/date-time-picker";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { ApiError, createTrip } from "@/lib/api";
import { toUtcMinute } from "@/lib/format";
import type { CreateTripInput, Trip } from "@/lib/types";

const initialForm: CreateTripInput = {
  current_location: "",
  pickup_location: "",
  dropoff_location: "",
  departure_time: "",
  current_cycle_used_hours: "0",
  driver_name: "",
  co_driver_name: "",
  carrier_name: "",
  main_office_address: "",
  vehicle_numbers: "",
  shipping_document_number: "",
};

type TripFormProps = {
  onTripCreated: (trip: Trip) => void;
};

const inputShellClass =
  "flex min-h-12 items-center gap-2.5 rounded-xl border border-field-border bg-white px-3.5 text-muted transition focus-within:border-orange focus-within:ring-3 focus-within:ring-orange/10";

export const TripForm = ({ onTripCreated }: TripFormProps) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof CreateTripInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const departureTime = toUtcMinute(form.departure_time);
    if (!departureTime) {
      setError("Choose a valid departure date and time.");
      setIsLoading(false);
      return;
    }

    try {
      const trip = await createTrip({
        ...form,
        departure_time: departureTime,
      });
      onTripCreated(trip);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Something went wrong while planning the trip.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="rounded-[22px] border border-forest/10 bg-paper p-6 text-ink shadow-panel-strong sm:p-8"
      onSubmit={handleSubmit}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.18em] text-orange">
            New dispatch
          </p>
          <h2 className="m-0 text-2xl font-bold tracking-[-.04em]">Build your trip plan</h2>
        </div>
        <span className="font-mono text-3xl font-bold text-line">01</span>
      </div>

      <LocationAutocomplete
        icon={<Navigation className="size-4" />}
        label="Current location"
        placeholder="Chicago, IL"
        value={form.current_location}
        onChange={(value) => updateField("current_location", value)}
      />
      <LocationAutocomplete
        className="[&>svg]:text-gold"
        icon={<MapPin className="size-4" />}
        label="Pickup location"
        placeholder="Milwaukee, WI"
        value={form.pickup_location}
        onChange={(value) => updateField("pickup_location", value)}
      />
      <LocationAutocomplete
        className="[&>svg]:text-orange"
        icon={<MapPin className="size-4" />}
        label="Drop-off location"
        placeholder="Dallas, TX"
        value={form.dropoff_location}
        onChange={(value) => updateField("dropoff_location", value)}
      />

      <div className="grid gap-3 sm:grid-cols-[1.55fr_.8fr]">
        <DateTimePicker
          value={form.departure_time}
          onChange={(value) => updateField("departure_time", value)}
        />
        <CycleHoursInput
          value={form.current_cycle_used_hours}
          onChange={(value) => updateField("current_cycle_used_hours", value)}
        />
      </div>

      <details className="mt-[18px] border-t border-line">
        <summary className="flex cursor-pointer list-none justify-between pt-4 text-xs font-extrabold text-forest marker:hidden">
          Log sheet details <span className="font-semibold text-muted">Optional</span>
        </summary>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <TextInput
            label="Driver name"
            value={form.driver_name}
            onChange={(value) => updateField("driver_name", value)}
          />
          <TextInput
            label="Co-driver"
            value={form.co_driver_name}
            onChange={(value) => updateField("co_driver_name", value)}
          />
          <TextInput
            label="Carrier"
            value={form.carrier_name}
            onChange={(value) => updateField("carrier_name", value)}
          />
          <TextInput
            label="Main office"
            value={form.main_office_address}
            onChange={(value) => updateField("main_office_address", value)}
          />
          <TextInput
            label="Vehicle numbers"
            value={form.vehicle_numbers}
            onChange={(value) => updateField("vehicle_numbers", value)}
          />
          <TextInput
            label="Shipping document"
            value={form.shipping_document_number}
            onChange={(value) => updateField("shipping_document_number", value)}
          />
        </div>
      </details>

      {error && (
        <p className="mt-4 border-l-3 border-danger bg-danger-soft px-3 py-2.5 text-xs text-danger-text">
          {error}
        </p>
      )}

      <button
        className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-2.5 rounded-xl border-0 bg-orange font-extrabold text-white transition hover:-translate-y-px hover:bg-orange-dark disabled:cursor-wait disabled:opacity-70"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? (
          <>
            <LoaderCircle className="size-5 animate-spin" />
            Building legal route...
          </>
        ) : (
          <>
            Generate trip plan
            <ArrowRight className="size-5" />
          </>
        )}
      </button>
      <p className="mt-3 text-center text-[11px] text-muted">
        No login required. Logs use home-terminal time.
      </p>
    </form>
  );
};

type TextInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const TextInput = ({ label, value, onChange }: TextInputProps) => (
  <label className="mt-4 block">
    <span className="mb-2 block text-xs font-bold text-field-text">{label}</span>
    <div className={inputShellClass}>
      <input
        className="w-full min-w-0 border-0 bg-transparent text-sm text-ink outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  </label>
);
