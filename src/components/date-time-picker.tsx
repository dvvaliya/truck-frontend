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
      } else if (!target.closest(".time-select")) {
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
    <div className="date-time-field">
      <span>Departure</span>
      <div ref={containerRef} className="date-time-container">
        <button
          className={isOpen ? "date-time-trigger open" : "date-time-trigger"}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={togglePicker}
        >
          <CalendarClock className="size-4" />
          <span className={value ? "" : "placeholder"}>
            {selectedMoment?.isValid()
              ? selectedMoment.format("MMM D, YYYY · h:mm A")
              : "Select departure"}
          </span>
          <ChevronDown className="date-time-chevron size-4" />
        </button>

        {isOpen && (
          <div
            ref={popoverRef}
            className="date-time-popover"
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

            <div className="time-picker">
              <div className="time-picker-heading">
                <Clock3 className="size-4" />
                Departure time
              </div>
              <div className="time-selects">
                <TimeSelect
                  label="Hour"
                  options={hours}
                  value={selectedMoment?.format("hh") ?? "12"}
                  isOpen={openTimeMenu === "hour"}
                  onToggle={() => setOpenTimeMenu((current) => current === "hour" ? null : "hour")}
                  onChange={(next) => updateTime("hour", next)}
                />
                <span className="time-separator">:</span>
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

            <div className="date-time-actions">
              <button type="button" onClick={chooseToday}>Next hour</button>
              <button
                className="done-button"
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
  <div className="time-select">
    <button
      className={isOpen ? "time-select-trigger open" : "time-select-trigger"}
      type="button"
      aria-label={label}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      onClick={onToggle}
    >
      <span>{value}</span>
      <ChevronDown className="size-4" />
    </button>
    {isOpen && (
      <div className="time-options" role="listbox" aria-label={label}>
        {options.map((option) => (
          <button
            className={option === value ? "time-option selected" : "time-option"}
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
