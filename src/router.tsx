import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Regions } from '@/pages/Regions';
import { Branches } from '@/pages/Branches';
import { Staff } from '@/pages/Staff';
import { Couriers } from '@/pages/Couriers';
import { CourierDetail } from '@/pages/CourierDetail';
import { Customers } from '@/pages/Customers';
import { Orders } from '@/pages/Orders';
import { OrderCreate } from '@/pages/OrderCreate';
import { OrderDetail } from '@/pages/OrderDetail';
import { PaymentProviders } from '@/pages/PaymentProviders';
import { NotFound } from '@/pages/NotFound';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Notifications } from './pages/Notifications';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'regions', element: <Regions /> },
      { path: 'branches', element: <Branches /> },
      { path: 'staff', element: <Staff /> },
      { path: 'couriers', element: <Couriers /> },
      { path: 'couriers/:id', element: <CourierDetail /> },
      { path: 'customers', element: <Customers /> },
      { path: 'orders', element: <Orders /> },
      { path: 'orders/new', element: <OrderCreate /> },       // ← NEW
      { path: 'orders/:id', element: <OrderDetail /> },        // ← NEW
      { path: 'payment-providers', element: <PaymentProviders /> },
      { path: 'notifications', element: <Notifications /> },   // ← ADD

      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
