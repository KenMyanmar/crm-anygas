
import { supabase } from '@/lib/supabase';
import { NearbyRestaurant } from './nearbyRestaurantService';
import { Restaurant } from '@/hooks/useRestaurants';

export class RestaurantMatchingService {
  
  async checkExistingRestaurants(nearbyRestaurants: NearbyRestaurant[]): Promise<NearbyRestaurant[]> {
    try {
      // Fetch all existing restaurants from database
      const { data: existingRestaurants, error } = await supabase
        .from('restaurants')
        .select('id, name, township, address, phone');

      if (error) {
        console.error('Error fetching existing restaurants:', error);
        return nearbyRestaurants;
      }

      // Check each nearby restaurant against existing ones
      return nearbyRestaurants.map(nearbyRestaurant => ({
        ...nearbyRestaurant,
        is_existing: this.isRestaurantExisting(nearbyRestaurant, existingRestaurants || [])
      }));

    } catch (error) {
      console.error('Error checking existing restaurants:', error);
      return nearbyRestaurants;
    }
  }

  private isRestaurantExisting(
    nearbyRestaurant: NearbyRestaurant, 
    existingRestaurants: any[]
  ): boolean {
    for (const existing of existingRestaurants) {
      // Primary match: Name + township combination
      if (this.isSimilarName(nearbyRestaurant.name, existing.name) &&
          this.isSimilarTownship(nearbyRestaurant.township, existing.township)) {
        return true;
      }

      // Secondary match: Address similarity
      if (this.isSimilarAddress(nearbyRestaurant.address, existing.address)) {
        return true;
      }

      // Tertiary match: Phone number
      if (nearbyRestaurant.phone && existing.phone && 
          this.isSimilarPhone(nearbyRestaurant.phone, existing.phone)) {
        return true;
      }
    }

    return false;
  }

  private isSimilarName(name1: string, name2: string): boolean {
    if (!name1 || !name2) return false;
    
    const normalize = (str: string) => str.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const n1 = normalize(name1);
    const n2 = normalize(name2);
    
    // Exact match
    if (n1 === n2) return true;
    
    // Contains match (for cases like "KFC" vs "KFC Restaurant")
    if (n1.includes(n2) || n2.includes(n1)) return true;
    
    // Similarity threshold (simplified Levenshtein)
    return this.calculateSimilarity(n1, n2) > 0.8;
  }

  private isSimilarTownship(township1: string, township2: string): boolean {
    if (!township1 || !township2) return false;
    
    const normalize = (str: string) => str.toLowerCase()
      .replace(/township|တောင်သူ|မြို့နယ်|ခရိုင်/g, '')
      .trim();
    
    return normalize(township1) === normalize(township2);
  }

  private isSimilarAddress(address1: string, address2: string): boolean {
    if (!address1 || !address2) return false;
    
    const normalize = (str: string) => str.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const a1 = normalize(address1);
    const a2 = normalize(address2);
    
    return this.calculateSimilarity(a1, a2) > 0.7;
  }

  private isSimilarPhone(phone1: string, phone2: string): boolean {
    if (!phone1 || !phone2) return false;
    
    const normalize = (str: string) => str.replace(/\D/g, '');
    const p1 = normalize(phone1);
    const p2 = normalize(phone2);
    
    // Check if one contains the other (for different formats)
    return p1.includes(p2) || p2.includes(p1);
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  async addNewRestaurants(restaurants: NearbyRestaurant[], salespersonId: string): Promise<boolean> {
    try {
      const newRestaurants = restaurants.map(restaurant => ({
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone || '',
        township: restaurant.township,
        salesperson_id: salespersonId,
        business_types: JSON.stringify(['prospect']),
        gas_customer_status: 'prospect',
        uco_supplier_status: 'not_assessed',
        remarks: `Added via nearby search. Place ID: ${restaurant.place_id}`
      }));

      const { error } = await supabase
        .from('restaurants')
        .insert(newRestaurants);

      if (error) {
        console.error('Error adding restaurants:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addNewRestaurants:', error);
      return false;
    }
  }
}
