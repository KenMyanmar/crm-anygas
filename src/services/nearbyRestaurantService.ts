
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
  types?: string[];
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
    radius: number = 3000
  ): Promise<NearbyRestaurant[]> {
    try {
      await this.loader.load();

      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      // Search for multiple restaurant types
      const searchTypes = ['restaurant', 'food', 'meal_takeaway', 'cafe'];
      const allResults: google.maps.places.PlaceResult[] = [];

      for (const type of searchTypes) {
        const request: google.maps.places.PlaceSearchRequest = {
          location: new google.maps.LatLng(lat, lng),
          radius: radius,
          type: type as any
        };

        const results = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
          service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              resolve([]);
            } else {
              reject(new Error(`Places search failed: ${status}`));
            }
          });
        });

        allResults.push(...results);
      }

      // Remove duplicates based on place_id
      const uniqueResults = allResults.filter((place, index, array) => 
        array.findIndex(p => p.place_id === place.place_id) === index
      );

      // Limit to first 30 results and get details
      const limitedResults = uniqueResults.slice(0, 30);
      const restaurants: NearbyRestaurant[] = [];
      
      for (const place of limitedResults) {
        if (place.place_id && place.geometry?.location) {
          const detailedPlace = await this.getPlaceDetails(place.place_id);
          if (detailedPlace) {
            restaurants.push(detailedPlace);
          }
        }
      }
      
      return restaurants;
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
          'user_ratings_total',
          'types'
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
            user_ratings_total: place.user_ratings_total,
            types: place.types
          };
          resolve(restaurant);
        } else {
          resolve(null);
        }
      });
    });
  }

  private extractTownship(address: string): string {
    // Enhanced township extraction for Myanmar addresses
    const parts = address.split(',').map(part => part.trim());
    
    // Common Myanmar township patterns (English and Myanmar)
    const townshipPatterns = [
      /(.+?)\s*(Township|တောင်သူ|မြို့နယ်|ခရိုင်)/i,
      /(.+?)\s*Tsp/i,
      /(.+?)\s*T\/S/i
    ];

    for (const part of parts) {
      for (const pattern of townshipPatterns) {
        const match = part.match(pattern);
        if (match) {
          return match[1].trim();
        }
      }
    }

    // Common Myanmar townships
    const knownTownships = [
      'Yangon', 'Mandalay', 'Bahan', 'Kamayut', 'Sanchaung', 'Mayangon', 
      'Insein', 'Hlaing', 'Kyimyindaing', 'Lanmadaw', 'Latha', 'Mingala Taungnyunt',
      'Pazundaung', 'Botataung', 'Dagon', 'Seikkan', 'Thingangyun', 'Yankin',
      'South Okkalapa', 'North Okkalapa', 'Thaketa', 'Dawbon', 'Tamwe'
    ];

    for (const part of parts) {
      for (const township of knownTownships) {
        if (part.toLowerCase().includes(township.toLowerCase())) {
          return township;
        }
      }
    }
    
    // Fallback: return the second-to-last part if available
    return parts.length >= 2 ? parts[parts.length - 2] : 'Unknown';
  }
}
