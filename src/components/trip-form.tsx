"use client";

import { ArrowRight, CalendarClock, Clock3, LoaderCircle, MapPin, Navigation } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

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
    <form className="planner-card" onSubmit={handleSubmit}>
      <div className="form-heading">
        <div>
          <p className="eyebrow">New dispatch</p>
          <h2>Build your trip plan</h2>
        </div>
        <span className="step-number">01</span>
      </div>

      <LocationAutocomplete
        icon={<Navigation className="size-4" />}
        label="Current location"
        placeholder="Chicago, IL"
        value={form.current_location}
        onChange={(value) => updateField("current_location", value)}
      />
      <LocationAutocomplete
        className="pickup-input"
        icon={<MapPin className="size-4" />}
        label="Pickup location"
        placeholder="Milwaukee, WI"
        value={form.pickup_location}
        onChange={(value) => updateField("pickup_location", value)}
      />
      <LocationAutocomplete
        className="dropoff-input"
        icon={<MapPin className="size-4" />}
        label="Drop-off location"
        placeholder="Dallas, TX"
        value={form.dropoff_location}
        onChange={(value) => updateField("dropoff_location", value)}
      />

      <div className="form-row">
        <label>
          <span>Departure</span>
          <div className="input-shell">
            <CalendarClock className="size-4" />
            <input
              required
              type="datetime-local"
              step="60"
              value={form.departure_time}
              onChange={(event) => updateField("departure_time", event.target.value)}
            />
          </div>
        </label>
        <label>
          <span>Cycle used</span>
          <div className="input-shell">
            <Clock3 className="size-4" />
            <input
              required
              type="number"
              min="0"
              max="70"
              step="0.25"
              value={form.current_cycle_used_hours}
              onChange={(event) =>
                updateField("current_cycle_used_hours", event.target.value)
              }
            />
            <small>hrs</small>
          </div>
        </label>
      </div>

      <details className="log-details">
        <summary>
          Log sheet details <span>Optional</span>
        </summary>
        <div className="details-fields">
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

      {error && <p className="form-error">{error}</p>}

      <button className="primary-button" disabled={isLoading} type="submit">
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
      <p className="form-note">No login required. Logs use home-terminal time.</p>
    </form>
  );
};

type TextInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const TextInput = ({ label, value, onChange }: TextInputProps) => (
  <label>
    <span>{label}</span>
    <div className="input-shell">
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  </label>
);
