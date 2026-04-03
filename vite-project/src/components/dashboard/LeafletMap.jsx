import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const markers = [
  { name: "Ponce", lat: 18.0111, lng: -66.6141, type: "critical", count: 12 },
  { name: "Bayamón", lat: 18.3985, lng: -66.1543, type: "verified" },
  { name: "Sabana Grande", lat: 18.0781, lng: -66.9594, type: "warning" },
  { name: "Arecibo", lat: 18.4721, lng: -66.7156, type: "normal" },
]

const heatmapAreas = [
  { lat: 18.05, lng: -66.55, size: 0.08, intensity: "high" },
  { lat: 18.02, lng: -66.60, size: 0.06, intensity: "high" },
  { lat: 18.08, lng: -66.50, size: 0.05, intensity: "high" },
  { lat: 18.35, lng: -66.20, size: 0.1, intensity: "medium", count: 12 },
  { lat: 18.15, lng: -66.40, size: 0.09, intensity: "high" },
  { lat: 18.12, lng: -66.38, size: 0.06, intensity: "medium" },
]

export function LeafletMap() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [18.2, -66.4],
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
    })

    mapInstanceRef.current = map

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map)

    const boundaryCoords = [
      [18.52, -67.27],
      [18.47, -67.10],
      [18.42, -66.90],
      [18.38, -66.70],
      [18.32, -66.50],
      [18.25, -66.30],
      [18.18, -66.10],
      [18.12, -65.90],
      [18.08, -65.75],
      [18.05, -65.60],
      [18.02, -65.65],
      [17.98, -65.80],
      [17.95, -66.00],
      [17.92, -66.20],
      [17.90, -66.40],
      [17.92, -66.60],
      [17.95, -66.80],
      [18.00, -67.00],
      [18.10, -67.15],
      [18.25, -67.25],
      [18.40, -67.30],
      [18.52, -67.27],
    ]

    L.polyline(boundaryCoords, {
      color: "#FF3B30",
      weight: 2,
      opacity: 0.8,
    }).addTo(map)

    heatmapAreas.forEach((area) => {
      const bounds = [
        [area.lat - area.size / 2, area.lng - area.size / 2],
        [area.lat + area.size / 2, area.lng + area.size / 2],
      ]

      const color = area.intensity === "high" ? "#FF3B30" : "#FF9500"

      L.rectangle(bounds, {
        color: color,
        weight: 1,
        fillColor: color,
        fillOpacity: 0.4,
      }).addTo(map)

      if (area.count) {
        const icon = L.divIcon({
          className: "custom-label",
          html: `<div style="
            background: rgba(255, 149, 0, 0.4);
            border: 1px solid rgba(255, 149, 0, 0.8);
            color: white;
            font-weight: bold;
            font-size: 14px;
            padding: 8px 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">${area.count}</div>`,
          iconSize: [60, 40],
          iconAnchor: [30, 20],
        })
        L.marker([area.lat, area.lng], { icon }).addTo(map)
      }
    })

    markers.forEach((marker) => {
      const markerColor =
        marker.type === "critical"
          ? "#FF3B30"
          : marker.type === "verified"
            ? "#007AFF"
            : marker.type === "warning"
              ? "#FF9500"
              : "#666"

      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="
              background: ${markerColor};
              padding: 4px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="white">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span style="
              color: white;
              font-size: 10px;
              font-weight: bold;
              margin-top: 4px;
              padding: 1px 4px;
              background: rgba(0,0,0,0.6);
              border-radius: 2px;
            ">${marker.name}</span>
          </div>
        `,
        iconSize: [80, 50],
        iconAnchor: [40, 50],
      })

      L.marker([marker.lat, marker.lng], { icon }).addTo(map)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return <div ref={mapRef} className="absolute inset-0" />
}
