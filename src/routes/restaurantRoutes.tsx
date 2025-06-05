
import { Route } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import RestaurantsList from '@/pages/placeholder/RestaurantsPage';
import RestaurantDetails from '@/pages/RestaurantDetailPage';
import CreateRestaurant from '@/pages/restaurants/NewRestaurantPage';
import EditRestaurant from '@/pages/RestaurantEditPage';

export const restaurantRoutes = (
  <>
    <Route path="/restaurants" element={
      <DashboardLayout>
        <RestaurantsList />
      </DashboardLayout>
    } />
    <Route path="/restaurants/:id" element={
      <DashboardLayout>
        <RestaurantDetails />
      </DashboardLayout>
    } />
    <Route path="/restaurants/new" element={
      <DashboardLayout>
        <CreateRestaurant />
      </DashboardLayout>
    } />
    <Route path="/restaurants/:id/edit" element={
      <DashboardLayout>
        <EditRestaurant />
      </DashboardLayout>
    } />
  </>
);
