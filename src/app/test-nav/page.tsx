import Navbar from '@/components/Navigation/Navbar';
import { FloatingNav } from '@/components/Navigation/FloatingNav';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <FloatingNav />
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-white text-2xl">Navbar Test Page</h1>
      </div>
    </div>
  );
}