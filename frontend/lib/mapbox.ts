// Mapbox configuration and utilities
export const MAPBOX_CONFIG = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
  defaultStyle: 'mapbox://styles/mapbox/streets-v12',
  satelliteStyle: 'mapbox://styles/mapbox/satellite-streets-v12',
  darkStyle: 'mapbox://styles/mapbox/dark-v11'
};

export const MAP_STYLES = {
  STREETS: MAPBOX_CONFIG.defaultStyle,
  SATELLITE: MAPBOX_CONFIG.satelliteStyle,
  DARK: MAPBOX_CONFIG.darkStyle
} as const;

export type MapStyle = typeof MAP_STYLES[keyof typeof MAP_STYLES];

// Helper function to check if Mapbox token is configured
export const isMapboxConfigured = (): boolean => {
  return !!MAPBOX_CONFIG.accessToken && MAPBOX_CONFIG.accessToken !== '';
};

// Default map center and zoom for fleet operations
export const DEFAULT_MAP_CONFIG = {
  center: [-88.306, 41.739] as [number, number], // [longitude, latitude]
  zoom: 13,
  pitch: 0,
  bearing: 0
};
