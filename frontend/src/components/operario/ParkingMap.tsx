"use client";

import React from "react";
import { useParkingContext, CAPACIDAD, CAR_ROWS, MOTO_ROWS } from "@/context/ParkingContext";

export function ParkingMap() {
  const { carSlots, motoSlots } = useParkingContext();

  const carsOcc = Object.values(carSlots).filter(Boolean).length;
  const motoOcc = Object.values(motoSlots).filter(Boolean).length;
  const carsFree = CAPACIDAD.cars - carsOcc;
  const motosFree = CAPACIDAD.motos - motoOcc;

  return (
    <div id="panel-mapa">
      <div className="map-legend">
        <div className="legend-item"><span className="ls ls-free"></span> Disponible</div>
        <div className="legend-item"><span className="ls ls-occ"></span> Ocupado</div>
      </div>

      {/* ZONA AUTOMÓVILES */}
      <div className="map-zone-title">
        <span className="mzt-dot blue"></span> Zona Automóviles
        <span className="mzt-count">
          {carsFree} libres · {carsOcc} ocupados
        </span>
      </div>
      <div className="map-lot" id="map-cars">
        {CAR_ROWS.map((row) => (
          <div key={row.label} className="map-row">
            <div className="map-row-label">{row.label}</div>
            <div className="map-row-spaces">
              {Array.from({ length: row.spots }).map((_, i) => {
                const spId = `${row.label}${i + 1}`;
                const v = carSlots[spId];
                return (
                  <div key={spId} className={`space ${v ? "occupied" : "free"}`} title={v ? `${v.placa} ocupado` : `${spId} Libre`}>
                    <span className="space-id">{spId}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* PASILLO */}
      <div className="map-aisle">
        <div className="aisle-line"></div>
        <div className="aisle-label">Entrada / Salida</div>
        <div className="aisle-line"></div>
      </div>

      {/* ZONA MOTOS */}
      <div className="map-zone-title">
        <span className="mzt-dot amber"></span> Zona Motocicletas
        <span className="mzt-count">
          {motosFree} libres · {motoOcc} ocupadas
        </span>
      </div>
      <div className="map-lot" id="map-motos">
        {MOTO_ROWS.map((row) => (
          <div key={row.label} className="map-row">
            <div className="map-row-label">{row.label}</div>
            <div className="map-row-spaces">
              {Array.from({ length: row.spots }).map((_, i) => {
                const spId = `${row.label}${i + 1}`;
                const v = motoSlots[spId];
                return (
                  <div key={spId} className={`space ${v ? "occupied" : "free"}`} title={v ? `${v.placa} ocupado` : `${spId} Libre`}>
                    <span className="space-id">{spId}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
