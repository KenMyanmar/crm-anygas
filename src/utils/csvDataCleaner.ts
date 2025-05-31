
export interface DataCleaningRules {
  phone: string[];
  contact_person: string[];
}

const CLEANING_RULES: DataCleaningRules = {
  phone: [
    'phone:',
    'phone number:',
    'tel:',
    'telephone:',
    'mobile:',
    'contact:',
    'ph:'
  ],
  contact_person: [
    'contact:',
    'contact person:',
    'contact_person:',
    'person:',
    'manager:',
    'name:'
  ]
};

export const cleanFieldValue = (value: string, fieldType: keyof DataCleaningRules): string => {
  if (!value || typeof value !== 'string') {
    return value;
  }

  let cleanedValue = value.trim();
  const rules = CLEANING_RULES[fieldType] || [];

  // Check each rule and remove matching prefixes (case-insensitive)
  for (const rule of rules) {
    const regex = new RegExp(`^${rule}\\s*`, 'gi');
    if (regex.test(cleanedValue)) {
      cleanedValue = cleanedValue.replace(regex, '').trim();
      break; // Only remove the first matching prefix
    }
  }

  return cleanedValue;
};

export const cleanRestaurantData = (restaurant: any): any => {
  const cleaned = { ...restaurant };

  // Clean phone field
  if (cleaned.phone) {
    cleaned.phone = cleanFieldValue(cleaned.phone, 'phone');
  }

  // Clean contact_person field
  if (cleaned.contact_person) {
    cleaned.contact_person = cleanFieldValue(cleaned.contact_person, 'contact_person');
  }

  return cleaned;
};
