export function LoadingSpinner({ fullScreen = true }: { fullScreen?: boolean }) {
  const spinner = (
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent" />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;
