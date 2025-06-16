
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { NearbyRestaurant } from '@/services/nearbyRestaurantService';

interface NearbyRestaurantMapProps {
  centerLocation: { lat: number; lng: number };
  restaurants: NearbyRestaurant[];
  onRestaurantClick?: (restaurant: NearbyRestaurant) => void;
  selectedRestaurants?: string[];
}

export const NearbyRestaurantMap = ({
  centerLocation,
  restaurants,
  onRestaurantClick,
  selectedRestaurants = []
}: NearbyRestaurantMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      const loader = new Loader({
        apiKey: 'AIzaSyA7nrAwDyBVjOQWnSZJoHlBIY6dDOnMUX8',
        version: 'weekly',
        libraries: ['places']
      });

      try {
        await loader.load();

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: centerLocation,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        setMap(mapInstance);

        // Add center marker
        new google.maps.Marker({
          position: centerLocation,
          map: mapInstance,
          title: 'Current Location',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24),
          }
        });

      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initializeMap();
  }, [centerLocation]);

  useEffect(() => {
    if (!map || !restaurants.length) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers for restaurants
    const newMarkers = restaurants.map(restaurant => {
      const isSelected = selectedRestaurants.includes(restaurant.place_id);
      const isExisting = restaurant.is_existing;

      const marker = new google.maps.Marker({
        position: { lat: restaurant.latitude, lng: restaurant.longitude },
        map: map,
        title: restaurant.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="${isExisting ? '#9CA3AF' : isSelected ? '#10B981' : '#EF4444'}" stroke="white" stroke-width="2"/>
              <text x="10" y="14" text-anchor="middle" fill="white" font-size="10" font-weight="bold">R</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(20, 20),
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        if (onRestaurantClick) {
          onRestaurantClick(restaurant);
        }
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold; font-size: 14px;">${restaurant.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${restaurant.township}</p>
            ${restaurant.rating ? `<p style="margin: 0; font-size: 12px;">⭐ ${restaurant.rating} (${restaurant.user_ratings_total || 0} reviews)</p>` : ''}
            <p style="margin: 4px 0 0 0; font-size: 11px; color: ${isExisting ? '#9CA3AF' : '#10B981'};">
              ${isExisting ? 'Already in database' : 'New restaurant'}
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(centerLocation);
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      map.fitBounds(bounds);
    }

  }, [map, restaurants, selectedRestaurants, onRestaurantClick]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-80 rounded-lg border border-gray-200"
      style={{ minHeight: '320px' }}
    />
  );
};
