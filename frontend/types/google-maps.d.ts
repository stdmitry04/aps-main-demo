// Google Maps API type declarations
declare global {
    interface Window {
        google?: {
            maps?: {
                places?: any;
                Map?: any;
                Marker?: any;
                LatLng?: any;
                [key: string]: any;
            };
            [key: string]: any;
        };
    }
}

export { };
