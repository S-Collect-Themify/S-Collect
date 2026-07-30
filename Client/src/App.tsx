import { Routes, Route } from 'react-router-dom';
import AppLayout from './pages/AppLayout.js';
import Dashboard from './pages/Dashboard.js';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings.js';
import AccountSettings from './pages/AccountSettings.js';
import Management from './pages/Mangement.js';
import AddProduct from './pages/AddProduct.js';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { X } from 'lucide-react';
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
        position={i18n.language === 'ar' ? 'top-left' : 'top-right'}
        gutter={10}
        toastOptions={{
          duration: 3500,
          className: 'unified-toast-item',
          style: {
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow:
              '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
            padding: '12px 16px',
            fontSize: '14px',
            maxWidth: '420px',
          },
          success: {
            duration: 3500,
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            duration: 4500,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <div className="flex items-center gap-2.5 w-full">
                {icon}
                <div className="flex-1 text-sm font-medium text-slate-800 leading-snug">
                  {message}
                </div>
                {t.type !== 'loading' && (
                  <button
                    type="button"
                    onClick={() => toast.dismiss(t.id)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md shrink-0 cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </ToastBar>
        )}
      </Toaster>
    </>
  );
}

export default App;
