
import React from 'react';
import { UcoCollectionItem } from '@/types/uco';

interface ContactInfoProps {
  restaurant: UcoCollectionItem['restaurant'];
  expectedVolume?: number;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({
  restaurant,
  expectedVolume
}) => {
  const hasContactInfo = restaurant.contact_person || restaurant.phone || expectedVolume;

  if (!hasContactInfo) return null;

  return (
    <div className="border-t pt-3">
      <div className="text-xs text-muted-foreground space-y-1">
        {restaurant.contact_person && (
          <div>Contact: {restaurant.contact_person}</div>
        )}
        {restaurant.phone && (
          <div>Phone: {restaurant.phone}</div>
        )}
        {expectedVolume && (
          <div>Expected: {expectedVolume}kg</div>
        )}
      </div>
    </div>
  );
};
