import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import AppLayout from './pages/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { scheduleRefreshTokenExpiration } from './services/auth';
import './App.css';

// Lazy loaded route components for optimal bundle splitting
const Login = lazy(() => import('./pages/auth/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const Management = lazy(() => import('./pages/Mangement'));
const AddProduct = lazy(() => import('./pages/AddProduct'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const ReturnRequests = lazy(() => import('./pages/ReturnRequests'));
const ReturnRequestDetails = lazy(() => import('./pages/ReturnRequestDetails'));
const Vendors = lazy(() => import('./pages/Vendors'));
const VendorDetails = lazy(() => import('./pages/VendorDetails'));
const VendorPayoutsPage = lazy(() => import('./pages/VendorPayoutsPage'));
const VendorOrdersPage = lazy(() => import('./pages/VendorOrdersPage'));
const VendorProductsPage = lazy(() => import('./pages/VendorProductsPage'));
const VendorReports = lazy(() => import('./pages/VendorReports'));
const CommissionRates = lazy(() => import('./pages/CommissionRates'));
const Payouts = lazy(() => import('./pages/Payouts'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Categories = lazy(() => import('./pages/Categories'));
const Products = lazy(() => import('./pages/Products'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Vouchers = lazy(() => import('./pages/Vouchers'));
const CreateVoucher = lazy(() => import('./pages/CreateVoucher'));
const Buyers = lazy(() => import('./pages/Buyers'));
const BuyerDetails = lazy(() => import('./pages/BuyerDetails'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="w-full h-full min-h-64 flex items-center justify-center p-8">
      <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
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
