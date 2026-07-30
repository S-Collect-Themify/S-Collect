import { Routes, Route } from 'react-router-dom';
import AppLayout from './pages/AppLayout.js';
import Dashboard from './pages/Dashboard.js';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings.js';
import AccountSettings from './pages/AccountSettings.js';
import Management from './pages/Mangement.js';
import AddProduct from './pages/AddProduct.js';
import { Toaster } from 'react-hot-toast';
import NotFound from './pages/NotFound.js';
import Login from './pages/auth/Login.js';
import Register from './pages/auth/Register.js';
import ForgetPass from './pages/auth/ForgetPass.js';
import ProtectedRoute from './components/auth/ProtectedRoute.js';
import { scheduleRefreshTokenExpiration } from './services/auth';
import './App.css';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import Orders from './pages/Orders.js';
import SubOrderDetails from './pages/SubOrderDetails.js';
import ProductDetails from './pages/ProductDetails.js';
import Receivables from './pages/Receivables.js';

import ReturnRequests from './pages/ReturnRequests.js';
import ReturnRequestDetails from './pages/ReturnRequestDetails.js';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    scheduleRefreshTokenExpiration();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scheduleRefreshTokenExpiration();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-pass" element={<ForgetPass />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/management" element={<Management />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/edit-product/:productId" element={<AddProduct />} />
          <Route path="/product-details/:id" element={<ProductDetails />} />
          <Route path="/product details/:id" element={<ProductDetails />} />
          <Route path="/receivables" element={<Receivables />} />
          <Route path="/incoming-orders" element={<Orders />} />
          <Route path="/returns" element={<ReturnRequests />} />
          <Route path="/returns/:id" element={<ReturnRequestDetails />} />
          <Route path="/incoming-orders/:id" element={<SubOrderDetails />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: 'green',
              secondary: 'white',
            },
          },
        }}
      />
    </>
  );
}

export default App;
