// ─── Vehicle Types ────────────────────────────────────────────────────────────

export type VehicleType = 'Sedán' | 'Camioneta' | 'Moto';
export type CobroType   = 'Fracción' | 'Hora' | 'Minuto' | 'Día';
export type UserRole    = 'Admin' | 'Operario';

// ─── Parking Map ──────────────────────────────────────────────────────────────

export interface ParkingRow {
  label: string;
  spots: number;
}

export interface Vehicle {
  placa:   string;
  tipo:    VehicleType;
  entrada: Date;
  slotId:  string;
}

/** Mapa de slots: slotId → Vehicle | null (null = libre) */
export type SlotMap = Record<string, Vehicle | null>;

// ─── Exit ─────────────────────────────────────────────────────────────────────

export interface ExitRecord {
  placa:         string;
  tipo:          VehicleType;
  entrada:       Date;
  salida:        Date;
  horas:         number; // Horas reales (floor)
  horasACobrar:  number; // Horas redondeadas para el cobro (ceil)
  mins:          number; // Minutos totales
  total:         number;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface Tarifa {
  id:     number;
  tipo:   VehicleType;
  cobro:  CobroType;
  valor:  number;
  activo: boolean;
}

export interface Usuario {
  id:      number;
  nombre:  string;
  email:   string;
  rol:     string;      // nombre del rol desde la API (ej. 'admin', 'operario')
  rol_id:  number;      // 1 = admin, 2 = operario
  activo:  boolean;
  acceso?: Date;
  ultimo_acceso?: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

/** Respuesta del endpoint GET /api/dashboard/en-curso */
export interface VehiculoEnCurso {
  id:                 number;
  placa:              string;
  tipo:               string;
  espacio:            string;
  fecha_hora_entrada: string;
  registrado_por:     string;
}

/** Respuesta del endpoint GET /api/dashboard/disponibilidad */
export interface DisponibilidadData {
  cars:  { total: number; libres: number; ocupados: number };
  motos: { total: number; libres: number; ocupados: number };
}

/** Respuesta del endpoint GET /api/dashboard/metricas */
export interface DashboardMetrics {
  vehiculos_salidos: number;
  total_dinero:      number;
  ocupacion_autos:   number;
  ocupacion_motos:   number;
  distribucion?:     { nombre: string; cantidad: number }[];
  movimientos?:      any[];
  zonas?:            { zona: string; total: number; ocupados: number }[];
}

export interface Movimiento {
  id:       number;
  placa:    string;
  tipo:     VehicleType;
  entrada:  Date;
  salida:   Date;
  duracion: string;
  tarifa:   number;
  total:    number;
  operario: string;
}

// ─── Availability ─────────────────────────────────────────────────────────────

export interface AvailabilityInfo {
  free:     number;
  total:    number;
  occupied: number;
  pct:      number;
  status:   'ok' | 'warn' | 'full';
}

// ─── Billing Calculation ──────────────────────────────────────────────────────

export interface BillingResult {
  horas:         number; // Horas reales (floor)
  horasACobrar:  number; // Horas redondeadas
  mins:          number; // Minutos totales
  tarifa:        number;
  total:         number;
}
