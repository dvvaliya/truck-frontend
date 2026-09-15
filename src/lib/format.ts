import moment from "moment-timezone";

export const formatDuration = (minutes: number | null) => {
  if (minutes === null) return "—";

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
};

export const formatEventDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!hours) return `${remainder} min`;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
};

export const formatHours = (minutes: number) =>
  (minutes / 60).toFixed(2).replace(/\.00$/, "");

export const formatTime = (value: string, timeZone: string) =>
  moment(value).tz(timeZone).format("MMM D, h:mm A z");

export const formatLogDate = (value: string, timeZone: string) =>
  moment.tz(value, "YYYY-MM-DD", timeZone).format("MMM D, YYYY");

export const toUtcMinute = (value: string) => {
  const parsed = moment(value);
  if (!parsed.isValid()) return null;

  return parsed.utc().seconds(0).milliseconds(0).toISOString();
};
