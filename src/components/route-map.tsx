"use client";

import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import type { RouteGeometry } from "@/lib/types";

function FitRoute({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds, { padding: [42, 42] });
  }, [bounds, map]);

  return null;
}

export default function RouteMap({ route }: { route: RouteGeometry }) {
  const positions: LatLngTuple[] = route.geometry.coordinates.map(
    ([longitude, latitude]) => [latitude, longitude],
  );
  const waypoints = route.properties.waypoints ?? [];

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
      <FitRoute bounds={bounds} />
    </MapContainer>
  );
}
