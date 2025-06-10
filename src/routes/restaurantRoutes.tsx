
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';
import RestaurantsPage from '@/pages/restaurants/RestaurantListPage';
import NewRestaurantPage from '@/pages/restaurants/NewRestaurantPage';
import RestaurantDetailPage from '@/pages/RestaurantDetailPage';
import RestaurantEditPage from '@/pages/RestaurantEditPage';

export const restaurantRoutes = [
  <Route key="restaurants" path="/restaurants" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <RestaurantsPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="restaurants-new" path="/restaurants/new" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <NewRestaurantPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="restaurants-detail" path="/restaurants/:id" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <RestaurantDetailPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />,
  <Route key="restaurants-edit" path="/restaurants/:id/edit" element={
    <ProtectedRoute>
      <ModernDashboardLayout>
        <RestaurantEditPage />
      </ModernDashboardLayout>
    </ProtectedRoute>
  } />
];
