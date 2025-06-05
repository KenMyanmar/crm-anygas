
import { Route } from 'react-router-dom';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import SetNewPassword from '@/pages/SetNewPassword';

export const authRoutes = (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/set-new-password" element={<SetNewPassword />} />
  </>
);
