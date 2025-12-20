"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { mockCases } from "../../data/mockCases";

export default function MapView() {
  const mapRef = useRef(null);

  useEffect(() => {
    let map;
    (async () => {
      const L = await import("leaflet");
      // Initialize map
      map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
        center: [30.3753, 69.3451], // Pakistan center approx
        zoom: 5,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Very simple geocoding heuristic: pick city-based coordinates; fallback to Pakistan.
      const cityCoords = {
        Lahore: [31.5204, 74.3587],
        Karachi: [24.8607, 67.0011],
        Islamabad: [33.6844, 73.0479],
        Rawalpindi: [33.5651, 73.0169],
      };

      mockCases.forEach((c) => {
        const base = c.city && cityCoords[c.city] ? cityCoords[c.city] : [30.3753, 69.3451];
        const jitter = [base[0] + (Math.random() - 0.5) * 0.1, base[1] + (Math.random() - 0.5) * 0.1];
        const marker = L.marker(jitter, { icon }).addTo(map);
        const title = c.case_type === "missing" ? "Missing" : "Found";
        const image = c.media?.[0]?.thumbnail_url || c.media?.[0]?.file_url;
        const popupHtml = `
          <div style="min-width: 220px;">
            <div style="font-weight:600;margin-bottom:4px;color:#111">${title}: ${c.name}</div>
            ${image ? `<img src="${image}" alt="${c.name}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:6px" />` : ""}
            <div style="font-size:12px;color:#333">${c.city}${c.area ? ", " + c.area : ""}</div>
            <div style="margin-top:6px">
              <a href="/cases#${c.case_id}" style="font-size:12px;color:#0ea77f;font-weight:600">View details</a>
            </div>
          </div>
        `;
        marker.bindPopup(popupHtml);
      });
    })();

    return () => {
      if (mapRef.current && mapRef.current._leaflet_id) {
        // Leaflet cleans up automatically when element is removed
      }
    };
  }, []);

  return (
    <div className="glass-card rounded-3xl border border-white/10 p-4">
      <div className="mb-3 text-sm text-emerald-100">Interactive map — click markers to view quick case info</div>
      <div ref={mapRef} className="h-[65vh] w-full rounded-2xl" />
    </div>
  );
}
