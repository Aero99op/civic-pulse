'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, GeoJSON, WMSTileLayer } from 'react-leaflet'
import { useEffect, useState, useMemo } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Report } from '@prisma/client'

// Fix for default marker icons in Leaflet with Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

const customIcon = new L.Icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface MapProps {
  readonly reports: Report[]
}

export default function LeafletMap({ reports }: MapProps) {
  const [geoData, setGeoData] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Switched to CDN for stability as local downloads can be flaky in some environments
    const CDN_URL = 'https://cdn.jsdelivr.net/gh/datameet/maps@master/Country/india-soi.geojson'
    fetch(CDN_URL)
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Error loading Indian boundary from CDN:', err))
  }, [])

  // Default center (Bhubaneswar)
  const defaultCenter: [number, number] = [20.2961, 85.8245]

  function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap()
    map.setView(center)
    return null
  }

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
        Loading Map...
      </div>
    )
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
    >
      <ChangeView center={defaultCenter} />

      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Premium Satellite (Esri)">
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="ISRO Bhuvan Political">
          <WMSTileLayer
            attribution='&copy; <a href="https://bhuvan.nrsc.gov.in">NRSC/ISRO</a>'
            url="https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms"
            layers="vec_base_layer"
            format="image/png"
            transparent={true}
            version="1.1.1"
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Community Political (Reliable)">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay checked name="Official Indian Boundary (SOI)">
          {geoData && (
            <GeoJSON
              data={geoData}
              style={{
                color: '#FF9933', // Saffron/Bharat Orange
                weight: 3,
                fillOpacity: 0,
                interactive: false
              }}
            />
          )}
        </LayersControl.Overlay>
      </LayersControl>

      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={customIcon}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-sm">{report.title}</h3>
              <p className="text-xs text-gray-600 my-1">{report.category}</p>
              <p className="text-xs">{report.status}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
