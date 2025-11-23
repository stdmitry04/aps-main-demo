export interface Vehicle {
  id: string;
  type: 'Bus' | 'Van' | 'SUV' | 'Truck';
  driver: string;
  route: string;
  status: 'In Service' | 'Needs Maintenance' | 'Out of Service';
  odometer: number;
  fuelPercentage: number;
  mpg: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  lastUpdate?: string;
}

export interface Route {
  id: string;
  name: string;
  color: string;
  stops: RouteStop[];
  isActive: boolean;
}

export interface RouteStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
}

export interface Geofence {
  id: string;
  name: string;
  type: 'school' | 'depot' | 'maintenance' | 'custom';
  color: string;
  polygon: [number, number][]; // [latitude, longitude] pairs
  isActive: boolean;
  description?: string;
}

export interface GeofenceEvent {
  id: string;
  vehicleId: string;
  geofenceId: string;
  eventType: 'enter' | 'exit';
  timestamp: string;
  message: string;
}

export interface FleetMapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface VehicleTelemetry {
  vehicleId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed: number;
  fuelPercentage: number;
  odometer: number;
  heading?: number;
}

export interface DTCCode {
  spn: number;
  fmi: number;
  description: string;
  alertMessage: string;
  preventiveInsight: string;
  potentialIssue: string;
  typicalCost: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
}

export interface MaintenanceAlert {
  id: string;
  vehicleId: string;
  dtcCode: DTCCode;
  status: 'active' | 'acknowledged' | 'resolved';
  workOrderId?: string;
  createdAt: string;
}

export interface WorkOrder {
  id: string; // e.g., "WO-2024-001"
  vehicleId: string;
  title: string;
  description?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'closed';
  createdAt: string;
  closedAt?: string;
  relatedCodes?: string[]; // SPN/FMI codes like "SPN 110 / FMI 0"
}

export interface InspectionReport {
  id: string;
  vehicleId: string;
  inspectorName: string;
  date: string;
  odometer: number;
  items: {
    brakesAndSteering: 'pass' | 'fail';
    lightsAndSignals: 'pass' | 'fail';
    hornAndWarning: 'pass' | 'fail';
    emergencyExits: 'pass' | 'fail';
    seatBelts: 'pass' | 'fail';
    tires: 'pass' | 'fail';
  };
  notes?: string;
  overallStatus: 'pass' | 'fail' | 'needs-attention';
}

export interface BusTelemetryData {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  engineHours: number;
  odometer: number;
  fuelEfficiency: number;
  lastServiceDate: string;
  nextServiceDue: number; // mileage
  dtcCodes: DTCCode[];
  serviceHistory: ServiceRecord[];
  healthMetrics?: VehicleHealthMetrics;
}

export interface VehicleHealthMetrics {
  engineOilPressure: number; // PSI
  engineOilTemp: number; // °F
  coolantTemp: number; // °F
  coolantLevel: number; // percentage
  batteryVoltage: number; // volts
  alternatorChargeRate: number; // amps
  dpfSootLevel: number; // percentage
  dpfRegenStatus: 'normal' | 'regen-needed' | 'regenerating' | 'regen-complete';
  fuelRailPressure: number; // PSI
  turboBoost: number; // PSI
  throttlePosition: number; // percentage
  historicalDTCs: DTCCode[]; // Previously resolved codes
}

export interface ServiceRecord {
  date: string;
  type: string;
  description: string;
  mileage: number;
  cost?: number;
}

// Roster & Student Check-in Types
export interface Student {
  id: string;
  name: string;
  grade: number;
  stopId: string;
  stopName: string;
  pickupTime: string; // Expected pickup time
  checkedIn: boolean;
  checkInTime?: string; // Actual check-in timestamp
  parentPhone?: string;
  notes?: string;
}

export interface BusRoster {
  id: string; // e.g., "ROSTER-2024-11-04-BUS-101"
  date: string; // ISO date string
  vehicleId: string;
  routeId: string;
  routeName: string;
  driverName: string;
  shift: 'morning' | 'afternoon';
  students: Student[];
  totalStudents: number;
  checkedInCount: number;
  missedCount: number;
  status: 'pending' | 'in-progress' | 'completed';
}

// Route Timeliness Types
export interface RouteScheduleStop {
  stopId: string;
  stopName: string;
  scheduledTime: string; // ISO timestamp
  actualTime?: string; // ISO timestamp
  delayMinutes?: number; // Positive = late, negative = early
}

export interface RouteTimeliness {
  vehicleId: string;
  routeId: string;
  date: string;
  currentStatus: 'on-time' | 'running-late' | 'running-early' | 'completed';
  currentDelayMinutes: number; // Current delay in minutes
  averageDelayMinutes: number; // Average delay across all stops today
  nextStopName?: string;
  nextStopScheduledTime?: string;
  stops: RouteScheduleStop[];
  parentsNotified: boolean;
  completedStops: number;
  totalStops: number;
}

export interface FleetTimelinessMetrics {
  date: string;
  averageDelayMinutes: number; // Fleet-wide average delay
  onTimePercentage: number; // Percentage of routes on time (within 2 min threshold)
  routesOnTime: number;
  routesLate: number;
  totalRoutes: number;
  last7DaysAverage: number; // Rolling 7-day average delay
  last30DaysAverage: number; // Rolling 30-day average delay
}
