export function MjolnirSidebar() {
  return (
    <aside className="w-64 bg-linear-to-br from-zinc-900 via-black to-zinc-950 border-r border-zinc-800/50 min-h-screen p-6">
      <div className="font-black text-2xl mb-10 bg-linear-to-r from-cyan-300 to-emerald-400 bg-clip-text text-transparent">
        MjolnirUI
      </div>
      <nav className="space-y-4">
        <a href="/dashboard" className="block text-white font-semibold hover:text-cyan-400 transition">Dashboard</a>
        <a href="/components" className="block text-white font-semibold hover:text-emerald-400 transition">Components</a>
        <a href="/templates" className="block text-white font-semibold hover:text-purple-400 transition">Templates</a>
        <a href="/account" className="block text-white font-semibold hover:text-pink-400 transition">Account</a>
      </nav>
    </aside>
  );
}
