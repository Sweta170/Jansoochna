import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icon issues in Leaflet with React
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
})

// Custom green marker for JanSoochna offices
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Dynamic Map Recenter component
const RecenterMap = ({ center }) => {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, 14)
    }
  }, [center, map])
  return null
}

const OfficeLocator = ({ officeName, pincode }) => {
  const [position, setPosition] = useState([30.9010, 75.8573]) // Ludhiana center default
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const geocodeOffice = async () => {
      setLoading(true)
      setError(false)
      
      try {
        const query = `${officeName}, ${pincode}, India`
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'JanSoochna-App-Geocoding' // Required by Nominatim policy
          }
        })
        const data = await response.json()

        if (data && data.length > 0) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)])
        } else {
          // Retry with just pincode if full name fails
          const pinQuery = `${pincode}, India`
          const pinUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pinQuery)}&format=json&limit=1`
          const pinResponse = await fetch(pinUrl, {
            headers: {
              'User-Agent': 'JanSoochna-App-Geocoding'
            }
          })
          const pinData = await pinResponse.json()
          
          if (pinData && pinData.length > 0) {
            setPosition([parseFloat(pinData[0].lat), parseFloat(pinData[0].lon)])
          } else {
            setError(true)
          }
        }
      } catch (err) {
        console.error('Geocoding error:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (officeName && pincode) {
      geocodeOffice()
    }
  }, [officeName, pincode])

  return (
    <div className="h-44 w-full rounded-xl overflow-hidden border border-jan-border relative">
      {loading && (
        <div className="absolute inset-0 bg-jan-surface flex items-center justify-center z-20">
          <div className="w-6 h-6 border-2 border-jan-green border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-jan-muted ml-2">Location map loading...</span>
        </div>
      )}
      
      {error && (
        <div className="absolute bottom-2 right-2 bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-semibold z-20 border border-yellow-200">
          Approximate location shown
        </div>
      )}

      <MapContainer
        center={position}
        zoom={14}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={greenIcon}>
          <Popup>
            <div className="text-xs font-semibold">
              <p className="text-jan-green-dk font-mukta">{officeName}</p>
              <p className="text-jan-muted font-normal">Pincode: {pincode}</p>
            </div>
          </Popup>
        </Marker>
        <RecenterMap center={position} />
      </MapContainer>
    </div>
  )
}

export default OfficeLocator
export { greenIcon }
