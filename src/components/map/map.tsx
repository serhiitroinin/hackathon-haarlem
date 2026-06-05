"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { MapPin } from "lucide-react";
import { useState } from "react";
import {
  Map as MapGL,
  Marker,
  NavigationControl,
  Popup,
} from "react-map-gl/maplibre";

// Free Carto basemap — no API key. Set NEXT_PUBLIC_MAPTILER_KEY for richer tiles.
const maptiler = process.env.NEXT_PUBLIC_MAPTILER_KEY;
const MAP_STYLE = maptiler
  ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptiler}`
  : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// De Koepel, Haarlem — the hackathon venue.
const HAARLEM = { longitude: 4.6462, latitude: 52.3874, zoom: 12 };

export type MapPoint = {
  id: string;
  longitude: number;
  latitude: number;
  title: string;
};

export function Map({
  points = [],
  onMapClick,
}: {
  points?: MapPoint[];
  onMapClick?: (lngLat: { longitude: number; latitude: number }) => void;
}) {
  const [active, setActive] = useState<MapPoint | null>(null);

  return (
    <div className="h-[28rem] overflow-hidden rounded-lg border">
      <MapGL
        initialViewState={HAARLEM}
        mapStyle={MAP_STYLE}
        onClick={(e) =>
          onMapClick?.({ longitude: e.lngLat.lng, latitude: e.lngLat.lat })
        }
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />
        {points.map((p) => (
          <Marker
            key={p.id}
            longitude={p.longitude}
            latitude={p.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setActive(p);
            }}
          >
            <MapPin className="text-primary h-6 w-6 cursor-pointer drop-shadow" />
          </Marker>
        ))}
        {active && (
          <Popup
            longitude={active.longitude}
            latitude={active.latitude}
            anchor="top"
            onClose={() => setActive(null)}
            closeOnClick={false}
          >
            <span className="text-sm font-medium text-black">
              {active.title}
            </span>
          </Popup>
        )}
      </MapGL>
    </div>
  );
}
