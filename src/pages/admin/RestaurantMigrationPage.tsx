
import React from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import RestaurantMigration from '@/components/admin/RestaurantMigration';

const RestaurantMigrationPage = () => {
  return (
    <PageContainer title="Restaurant Data Migration">
      <RestaurantMigration />
    </PageContainer>
  );
};

export default RestaurantMigrationPage;
