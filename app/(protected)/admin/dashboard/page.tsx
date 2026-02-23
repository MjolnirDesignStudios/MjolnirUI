export default function AdminDashboard() {
  return (
    <div className="space-y-16">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-black mb-4 bg-linear-to-r from-white via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-xl text-gray-300">
          Manage users, subscriptions, and project settings.
        </p>
      </div>
      {/* Add admin controls and analytics here */}
    </div>
  );
}
