import { getProviders, signIn } from "next-auth/react";
import Image from "next/image";

export default async function SignIn() {
  const providers = await getProviders();
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
        <Image src="/Images/footer-grid.svg" alt="bg" fill className="absolute inset-0 opacity-20 object-cover object-center pointer-events-none" />
        <h2 className="text-3xl font-black text-white mb-8 text-center">Sign in to MjolnirUI</h2>
        <div className="space-y-4">
          {providers && Object.values(providers).map((provider) => (
            <button
              key={provider.name}
              onClick={() => signIn(provider.id)}
              className="w-full py-3 bg-linear-to-r from-cyan-500 to-emerald-500 text-black font-bold rounded-xl hover:brightness-110 transition"
            >
              Sign in with {provider.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
