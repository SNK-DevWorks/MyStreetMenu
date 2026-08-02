import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#FFF0E5] flex items-center justify-center p-6 text-center">
      <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl border border-orange-100 max-w-md w-full flex flex-col items-center gap-5">
        <span className="text-6xl font-black text-[#FF5A00]">404</span>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Page Not Found</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="w-full pt-2">
          <Link
            href="/"
            className="w-full bg-[#FF5A00] hover:bg-[#e04f00] text-white font-bold py-3.5 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <Home size={18} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
