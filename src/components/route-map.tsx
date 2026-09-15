"use client";

import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import type { RouteGeometry, TripEvent } from "@/lib/types";

const FitRoute = ({ bounds }: { bounds: LatLngBoundsExpression }) => {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds, { padding: [42, 42] });
  }, [bounds, map]);

  return null;
};

const RouteMap = ({ route, events }: { route: RouteGeometry; events: TripEvent[] }) => {
  const positions = useMemo<LatLngTuple[]>(
    () =>
      route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]),
    [route.geometry.coordinates],
  );
  const waypoints = route.properties.waypoints ?? [];
  const stops = useMemo(
    () =>
      events.filter(
        (event) =>
          ["break", "fuel", "rest"].includes(event.event_type) &&
          event.latitude !== null &&
          event.longitude !== null,
      ),
    [events],
  );

  if (positions.length < 2) {
    return <div className="map-empty">Route geometry is unavailable.</div>;
  }

  const bounds: LatLngBoundsExpression = positions;

  return (
    <MapContainer bounds={bounds} className="route-map" scrollWheelZoom zoomControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={positions} pathOptions={{ color: "#e25f2d", weight: 5 }} />
      {waypoints.map((waypoint, index) => (
        <CircleMarker
          key={`${waypoint.label}-${index}`}
          center={[waypoint.coordinates[1], waypoint.coordinates[0]]}
          radius={index === 1 ? 8 : 7}
          pathOptions={{
            color: "#fffaf0",
            fillColor: index === 1 ? "#e8aa2e" : "#173f3a",
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Popup>
            <strong>{["Start", "Pickup", "Drop-off"][index]}</strong>
            <br />
            {waypoint.label}
          </Popup>
        </CircleMarker>
      ))}
      {stops.map((stop) => (
        <CircleMarker
          key={stop.id}
          center={[Number(stop.latitude), Number(stop.longitude)]}
          radius={6}
          pathOptions={{
            color: "#fffaf0",
            fillColor: stop.event_type === "fuel" ? "#e8aa2e" : "#e25f2d",
            fillOpacity: 1,
            weight: 2,
          }}
        >
          <Popup>
            <strong>{stop.remarks}</strong>
            <br />
            {stop.location}
          </Popup>
        </CircleMarker>
      ))}
      <FitRoute bounds={bounds} />
    </MapContainer>
  );
};

export default RouteMap;
