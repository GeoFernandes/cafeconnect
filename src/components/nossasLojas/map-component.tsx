import React, { useState, useEffect } from "react"

interface MapComponentProps {
  address: string
}

const MapComponent: React.FC<MapComponentProps> = ({ address }) => {
  const [mapUrl, setMapUrl] = useState("")

  useEffect(() => {
    const encodedAddress = encodeURIComponent(address)
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("Erro: Chave da API do Google Maps não encontrada!")
      return
    }

    setMapUrl(
      `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}`
    )
  }, [address])

  return (
    <div
      className="map-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "20px 0",
        width: "100 %",
        height: "100 %",
        position: "relative",
      }}
    >
      <iframe
        width="400"
        height="300"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "8px",
          top: "0",
          left: "0",
        }}
        loading="lazy"
        allowFullScreen
        src={mapUrl}
        title={`Mapa para ${address}`}
      ></iframe>
    </div>
  )
}

export default MapComponent
