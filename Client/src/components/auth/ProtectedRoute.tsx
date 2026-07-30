import { useState, type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import OnboardingStatus from '../../pages/auth/OnboardingStatus';
import { VENDOR_STATUS, clearTokens } from '../../services/auth';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children?: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const {
    token,
    isUnauthorized,
    isLoading,
    isError,
    status,
    rejectionReason,
    refetch,
  } = useOnboardingStatus();

  if (!token || isUnauthorized || retryCount >= 2) {
    if (retryCount >= 2) {
      clearTokens();
    }
    return <Navigate to="/login" replace />;
  }

  const handleRetry = async () => {
    setIsRetrying(true);
    const res = await refetch();
    setIsRetrying(false);
    if (res.isError) {
      setRetryCount((prev) => prev + 1);
    } else {
      setRetryCount(0);
    }
  };

  if (isLoading || isRetrying) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Unable to Load Account Status
        </h2>
        <p className="text-xs text-gray-500 mb-4 max-w-sm">
          There was an error verifying your account status. Please check your
          network connection and try again.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          disabled={isRetrying}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isRetrying ? 'Retrying...' : 'Retry Verification'}
        </button>
      </div>
    );
  }

  if (
    status === VENDOR_STATUS.PENDING_APPROVAL ||
    status === VENDOR_STATUS.REJECTED
  ) {
    return (
      <OnboardingStatus
        status={status}
        rejectionReason={rejectionReason}
        onRetry={handleRetry}
      />
    );
  }

  return children ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
