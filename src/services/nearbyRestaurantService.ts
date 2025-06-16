
import { Loader } from '@googlemaps/js-api-loader';

export interface NearbyRestaurant {
  place_id: string;
  name: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  township: string;
  rating?: number;
  user_ratings_total?: number;
  is_existing?: boolean;
}

export class NearbyRestaurantService {
  private loader: Loader;
  private map: google.maps.Map | null = null;

  constructor(private apiKey: string) {
    this.loader = new Loader({
      apiKey: this.apiKey,
      version: 'weekly',
      libraries: ['places']
    });
  }

  async findNearbyRestaurants(
    lat: number, 
    lng: number, 
    radius: number = 5000
  ): Promise<NearbyRestaurant[]> {
    try {
      await this.loader.load();

      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(lat, lng),
        radius: radius,
        type: 'restaurant'
      };

      return new Promise((resolve, reject) => {
        service.nearbySearch(request, async (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const restaurants: NearbyRestaurant[] = [];
            
            // Limit to first 20 results
            const limitedResults = results.slice(0, 20);
            
            for (const place of limitedResults) {
              if (place.place_id && place.geometry?.location) {
                const detailedPlace = await this.getPlaceDetails(place.place_id);
                if (detailedPlace) {
                  restaurants.push(detailedPlace);
                }
              }
            }
            
            resolve(restaurants);
          } else {
            reject(new Error(`Places search failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Error finding nearby restaurants:', error);
      throw error;
    }
  }

  private async getPlaceDetails(placeId: string): Promise<NearbyRestaurant | null> {
    return new Promise((resolve) => {
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      service.getDetails({
        placeId: placeId,
        fields: [
          'place_id',
          'name', 
          'formatted_address',
          'formatted_phone_number',
          'geometry',
          'rating',
          'user_ratings_total'
        ]
      }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const restaurant: NearbyRestaurant = {
            place_id: place.place_id!,
            name: place.name!,
            address: place.formatted_address!,
            phone: place.formatted_phone_number,
            latitude: place.geometry!.location!.lat(),
            longitude: place.geometry!.location!.lng(),
            township: this.extractTownship(place.formatted_address!),
            rating: place.rating,
            user_ratings_total: place.user_ratings_total
          };
          resolve(restaurant);
        } else {
          resolve(null);
        }
      });
    });
  }

  private extractTownship(address: string): string {
    // Extract township from Myanmar address format
    const parts = address.split(',').map(part => part.trim());
    
    // Look for common Myanmar township patterns
    for (const part of parts) {
      if (part.includes('Township') || part.includes('တောင်သူ') || 
          part.includes('မြို့နယ်') || part.includes('ခရိုင်')) {
        return part.replace(/Township|တောင်သူ|မြို့နယ်|ခရိုင်/g, '').trim();
      }
    }
    
    // Fallback: return the second-to-last part if available
    return parts.length >= 2 ? parts[parts.length - 2] : 'Unknown';
  }
}
