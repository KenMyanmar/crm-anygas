
import { Route } from 'react-router-dom';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import SetNewPassword from '@/pages/SetNewPassword';
import NotFound from '@/pages/NotFound';

export const publicRoutes = [
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="forgot-password" path="/forgot-password" element={<ForgotPassword />} />,
  <Route key="reset-password" path="/reset-password" element={<ResetPassword />} />,
  <Route key="set-new-password" path="/set-new-password" element={<SetNewPassword />} />,
  <Route key="not-found" path="*" element={<NotFound />} />
];
