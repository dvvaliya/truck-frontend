"use client";

import { DayPicker } from "@daypicker/react";
import { CalendarClock, Check, ChevronDown, Clock3 } from "lucide-react";
import moment from "moment-timezone";
import { useEffect, useMemo, useRef, useState } from "react";

type DateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

type TimePart = "hour" | "minute" | "meridiem";

const hours = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);
const minutes = ["00", "15", "30", "45"];
const meridiems = ["AM", "PM"];

export const DateTimePicker = ({ value, onChange }: DateTimePickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openTimeMenu, setOpenTimeMenu] = useState<TimePart | null>(null);
  const selectedMoment = useMemo(() => (value ? moment(value) : null), [value]);
  const selectedDate = useMemo(
    () => (selectedMoment?.isValid() ? selectedMoment.toDate() : undefined),
    [selectedMoment],
  );

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!containerRef.current?.contains(target)) {
        setIsOpen(false);
        setOpenTimeMenu(null);
      } else if (!target.closest("[data-time-select]")) {
        setOpenTimeMenu(null);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const getBaseMoment = () =>
    selectedMoment?.clone() ?? moment().add(1, "hour").startOf("hour");

  const updateValue = (nextValue: moment.Moment) => {
    onChange(nextValue.seconds(0).milliseconds(0).format("YYYY-MM-DDTHH:mm"));
  };

  const selectDate = (date: Date | undefined) => {
    if (!date) return;

    const nextValue = getBaseMoment()
      .year(date.getFullYear())
      .month(date.getMonth())
      .date(date.getDate());
    updateValue(nextValue);
  };

  const updateTime = (part: TimePart, next: string) => {
    const nextValue = getBaseMoment();

    if (part === "minute") nextValue.minute(Number(next));
    if (part === "hour") {
      const hour = Number(next) % 12;
      nextValue.hour(nextValue.format("A") === "PM" ? hour + 12 : hour);
    }
    if (part === "meridiem") {
      const currentHour = nextValue.hour();
      if (next === "AM" && currentHour >= 12) nextValue.subtract(12, "hours");
      if (next === "PM" && currentHour < 12) nextValue.add(12, "hours");
    }

    updateValue(nextValue);
    setOpenTimeMenu(null);
  };

  const chooseToday = () => {
    updateValue(moment().add(1, "hour").startOf("hour"));
  };

  const togglePicker = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    window.setTimeout(() => {
      if (window.matchMedia("(max-width: 600px)").matches) return;

      const popoverBottom = popoverRef.current?.getBoundingClientRect().bottom;
      if (!popoverBottom) return;

      const hiddenHeight = popoverBottom - window.innerHeight + 24;
      if (hiddenHeight > 0) {
        window.scrollBy({ top: hiddenHeight, behavior: "smooth" });
      }
    }, 0);
  };

  return (
    <div className="relative mt-4">
      <span className="mb-2 block text-xs font-bold text-field-text">Departure</span>
      <div ref={containerRef} className="relative">
        <button
          className={`flex min-h-12 w-full items-center gap-2.5 rounded-xl border bg-white px-3.5 text-ink transition hover:border-orange ${
            isOpen
              ? "border-orange ring-3 ring-orange/10"
              : "border-field-border"
          }`}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={togglePicker}
        >
          <CalendarClock className="size-4 text-orange" />
          <span className={`flex-1 overflow-hidden text-left text-[13px] text-ellipsis whitespace-nowrap ${value ? "" : "text-muted-light"}`}>
            {selectedMoment?.isValid()
              ? selectedMoment.format("MMM D, YYYY · h:mm A")
              : "Select departure"}
          </span>
          <ChevronDown className={`size-4 text-muted transition ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div
            ref={popoverRef}
            className="fixed top-1/2 left-1/2 z-[1200] max-h-[calc(100vh-28px)] w-[min(350px,calc(100vw-28px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-field-border bg-white p-4 shadow-popover sm:absolute sm:top-[calc(100%+8px)] sm:left-0 sm:max-h-[min(540px,calc(100vh-32px))] sm:w-[min(350px,calc(100vw-72px))] sm:translate-x-0 sm:translate-y-0"
            role="dialog"
            aria-label="Choose departure time"
          >
            <DayPicker
              animate
              mode="single"
              navLayout="around"
              selected={selectedDate}
              defaultMonth={selectedDate}
              onSelect={selectDate}
              disabled={{ before: moment().startOf("day").toDate() }}
              showOutsideDays
            />

            <div className="mt-3 border-t border-line pt-3.5">
              <div className="mb-2.5 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-field-text">
                <Clock3 className="size-4" />
                Departure time
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr_1fr] items-center gap-2">
                <TimeSelect
                  label="Hour"
                  options={hours}
                  value={selectedMoment?.format("hh") ?? "12"}
                  isOpen={openTimeMenu === "hour"}
                  onToggle={() => setOpenTimeMenu((current) => current === "hour" ? null : "hour")}
                  onChange={(next) => updateTime("hour", next)}
                />
                <span className="font-black text-muted">:</span>
                <TimeSelect
                  label="Minute"
                  options={minutes}
                  value={selectedMoment?.format("mm") ?? "00"}
                  isOpen={openTimeMenu === "minute"}
                  onToggle={() => setOpenTimeMenu((current) => current === "minute" ? null : "minute")}
                  onChange={(next) => updateTime("minute", next)}
                />
                <TimeSelect
                  label="AM or PM"
                  options={meridiems}
                  value={selectedMoment?.format("A") ?? "AM"}
                  isOpen={openTimeMenu === "meridiem"}
                  onToggle={() => setOpenTimeMenu((current) => current === "meridiem" ? null : "meridiem")}
                  onChange={(next) => updateTime("meridiem", next)}
                />
              </div>
            </div>

            <div className="mt-3.5 flex items-center justify-between">
              <button className="cursor-pointer rounded-lg border-0 bg-transparent px-2.5 py-2 text-[11px] font-extrabold text-forest hover:bg-surface-soft" type="button" onClick={chooseToday}>Next hour</button>
              <button
                className="cursor-pointer rounded-lg border-0 bg-forest px-4 py-2 text-[11px] font-extrabold text-white hover:bg-forest-deep"
                type="button"
                onClick={() => {
                  setOpenTimeMenu(null);
                  setIsOpen(false);
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

type TimeSelectProps = {
  label: string;
  options: string[];
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
};

const TimeSelect = ({
  label,
  options,
  value,
  isOpen,
  onToggle,
  onChange,
}: TimeSelectProps) => (
  <div className="relative" data-time-select>
    <button
      className={`flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border bg-surface-input px-2.5 text-[13px] font-bold text-forest ${
        isOpen ? "border-orange ring-2 ring-orange/10" : "border-field-border"
      }`}
      type="button"
      aria-label={label}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      onClick={onToggle}
    >
      <span>{value}</span>
      <ChevronDown className={`size-4 transition ${isOpen ? "rotate-180" : ""}`} />
    </button>
    {isOpen && (
      <div className="absolute right-0 bottom-[calc(100%+6px)] left-0 z-10 max-h-48 overflow-y-auto rounded-[10px] border border-field-border bg-white p-1 shadow-menu" role="listbox" aria-label={label}>
        {options.map((option) => (
          <button
            className={`flex w-full cursor-pointer items-center justify-between rounded-md border-0 px-2 py-2 text-xs font-bold ${
              option === value
                ? "bg-surface-soft text-forest [&>svg]:text-orange"
                : "bg-transparent text-field-text hover:bg-surface-soft hover:text-forest"
            }`}
            key={option}
            type="button"
            role="option"
            aria-selected={option === value}
            onClick={() => onChange(option)}
          >
            <span>{option}</span>
            {option === value && <Check className="size-4" />}
          </button>
        ))}
      </div>
    )}
  </div>
);
