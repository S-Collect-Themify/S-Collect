import { Link } from 'react-router-dom';
const NotFound = () => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#f5f7fb] h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col justify-center items-center gap-7">
        
      <h1 className="text-6xl font-bold ">404 </h1>
      <h1 className="text-6xl font-bold ">Page Not Found</h1>
      </div>
      <Link
        to="/"
        className="mt-6 px-6 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition hover:underline"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
