export type DutyStatus =
  | "off_duty"
  | "sleeper_berth"
  | "driving"
  | "on_duty";

export type TripEvent = {
  id: string;
  sequence: number;
  event_type: string;
  duty_status: DutyStatus;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location: string;
  latitude: string | null;
  longitude: string | null;
  distance_miles: string;
  remarks: string;
};

export type LogSegment = {
  event_type: string;
  duty_status: DutyStatus;
  start_time: string;
  end_time: string;
  start_minute: number;
  end_minute: number;
  duration_minutes: number;
  location: string;
  distance_miles: string;
  remarks: string;
};

export type DailyLog = {
  date: string;
  time_zone: string;
  total_miles: string;
  total_minutes: number;
  duty_totals_minutes: Record<DutyStatus, number>;
  segments: LogSegment[];
};

export type RouteGeometry = {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  properties: {
    waypoints: {
      label: string;
      coordinates: [number, number];
    }[];
    legs?: {
      origin: string;
      destination: string;
      distance_miles: string;
      duration_minutes: number;
    }[];
  };
};

export type Trip = {
  id: string;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  departure_time: string;
  home_terminal_timezone: string;
  driver_name: string;
  co_driver_name: string;
  carrier_name: string;
  main_office_address: string;
  vehicle_numbers: string;
  shipping_document_number: string;
  current_cycle_used_hours: string;
  distance_miles: string | null;
  estimated_duration_minutes: number | null;
  route_geometry: RouteGeometry | Record<string, never>;
  status: "draft" | "planned" | "failed";
  calculation_error: string;
  events: TripEvent[];
  daily_logs: DailyLog[];
  created_at: string;
  updated_at: string;
};

export type CreateTripInput = {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  departure_time: string;
  current_cycle_used_hours: string;
  driver_name: string;
  co_driver_name: string;
  carrier_name: string;
  main_office_address: string;
  vehicle_numbers: string;
  shipping_document_number: string;
};

export type LocationSuggestion = {
  label: string;
  longitude: number;
  latitude: number;
};
