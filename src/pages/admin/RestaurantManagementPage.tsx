
import React from 'react';
import PageContainer from '@/components/layouts/PageContainer';
import RestaurantManagement from '@/components/admin/RestaurantManagement';

const RestaurantManagementPage = () => {
  return (
    <PageContainer title="Restaurant Management">
      <RestaurantManagement />
    </PageContainer>
  );
};

export default RestaurantManagementPage;
