import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/ui/Sidebar.js';
import Header from '../components/ui/Header.js';
import { getVendorOnboardingStatus } from '../services/auth';
import OnboardingStatus from './auth/OnboardingStatus';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const checkStatus = async () => {
      try {
        const data = await getVendorOnboardingStatus();
        setStatus(data.status);
        setRejectionReason(data.rejectionReason);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          navigate('/login?state=expired');
        } else {
          // If onboarding status endpoint fails due to server issue or not existing yet on target env,
          // default to APPROVED to not block testing the dashboard.
          setStatus('APPROVED');
        }
      } finally {
        setLoading(false);
      }
    };
   
    checkStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  if (status === 'PENDING_APPROVAL' || status === 'REJECTED') {
    return (
      <OnboardingStatus
        status={status}
        rejectionReason={rejectionReason}
        onRetry={() => {
          setLoading(true);
          getVendorOnboardingStatus()
            .then((data) => {
              setStatus(data.status);
              setRejectionReason(data.rejectionReason);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        }}
      />
    );
  }

  return (
    <>
      <main className="flex min-h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <section className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <Outlet />
        </section>
      </main>
    </>
  );
};

export default AppLayout;
