import { Routes, Route } from 'react-router-dom';
import AppLayout from './pages/AppLayout.js';
import Dashboard from './pages/Dashboard.js';
import AccountSettings from './pages/AccountSettings.js';
import Management from './pages/Mangement.js';
import AddProduct from './pages/AddProduct.js';
import { Toaster } from 'react-hot-toast';
import NotFound from './pages/NotFound.js';
import Login from './pages/auth/Login';
import './App.css';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import Orders from './pages/Orders.js';
import OrderDetails from './pages/OrderDetails.js';
import ProductDetails from './pages/ProductDetails.js';

import ReturnRequests from './pages/ReturnRequests.js';
import ReturnRequestDetails from './pages/ReturnRequestDetails.js';
import Vendors from './pages/Vendors.js';
import VendorDetails from './pages/VendorDetails.js';
import VendorPayoutsPage from './pages/VendorPayoutsPage.js';
import VendorOrdersPage from './pages/VendorOrdersPage.js';
import VendorProductsPage from './pages/VendorProductsPage.js';
import VendorReports from './pages/VendorReports.js';
import CommissionRates from './pages/CommissionRates.js';
import Payouts from './pages/Payouts.js';
import Transactions from './pages/Transactions.js';
import Categories from './pages/Categories.js';
import Products from './pages/Products.js';
import Reviews from './pages/Reviews.js';
import Vouchers from './pages/Vouchers.js';
import CreateVoucher from './pages/CreateVoucher.js';
import Buyers from './pages/Buyers.js';
import BuyerDetails from './pages/BuyerDetails.js';
import AdminSettings from './pages/AdminSettings.js';

import ProtectedRoute from './components/auth/ProtectedRoute.js';
import { scheduleRefreshTokenExpiration } from './services/auth.js';

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

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/management" element={<Management />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/product-details" element={<ProductDetails />} />
          <Route path="/product-details/:id" element={<ProductDetails />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/incoming-orders" element={<Orders />} />
          <Route path="/returns" element={<ReturnRequests />} />
          <Route path="/returns/:id" element={<ReturnRequestDetails />} />
          <Route path="/incoming-orders/:id" element={<OrderDetails />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/vendors/:id" element={<VendorDetails />} />
          <Route path="/vendors/:id/payouts" element={<VendorPayoutsPage />} />
          <Route path="/vendors/:id/orders" element={<VendorOrdersPage />} />
          <Route path="/vendors/:id/products" element={<VendorProductsPage />} />
          <Route path="/vendor-reports" element={<VendorReports />} />
          <Route path="/commission-rates" element={<CommissionRates />} />
          <Route path="/payouts" element={<Payouts />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products" element={<Products />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/vouchers/create" element={<CreateVoucher />} />
          <Route path="/vouchers/edit/:id" element={<CreateVoucher />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/buyers" element={<Buyers />} />
          <Route path="/buyers/:id" element={<BuyerDetails />} />
          <Route path="/admin-settings" element={<AdminSettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            zIndex: 99999,
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
