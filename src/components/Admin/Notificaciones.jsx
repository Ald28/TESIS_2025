import React from 'react'

export default function Notificaciones() {
  return (
    <div>
      <h1 className="text-center">Notificaciones</h1>
      <div className="d-flex justify-content-center align-items-center flex-column">
        <img
          src="/src/assets/images/icon.png"
          alt="Icono"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "10px",
          }}
        />
        <h5 className="mb-0 text-center">No tienes notificaciones</h5>
      </div>
    </div>
  )
}
