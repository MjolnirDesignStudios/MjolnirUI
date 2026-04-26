import ShaderBG_Type1 from '@/components/ShaderBG_Type1';
import Navbar_V2 from '@/components/Navigation/Navbar_V2';
import { FloatingNav } from '@/components/Navigation/FloatingNav';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Build from '@/components/Build';
import Demo from '@/components/Demo';
import Pricing from '@/components/Pricing';
import Tech from '@/components/Tech';

export default function Home() {
	return (
		<main className="relative min-h-screen overflow-x-hidden">
			{/* Background Layer - Shader BG behind everything */}
			<ShaderBG_Type1 />

			{/* Navigation Layer - Above BG, below content */}
			{/* Floating Nav — Mobile Only */}
			<div className="block lg:hidden w-full">
				<FloatingNav />
			</div>
			{/* Navbar — Desktop Only */}
			<div className="hidden lg:block">
				<Navbar_V2 />
			</div>

			{/* Content Layer - Above BG and Nav, main page content */}
			<div className="relative z-10">
				<div className="bg-transparent w-full">
					{/* Hero Section */}
					<Hero />

					{/* Build Section — Founder's Kit */}
					<Build />

					{/* Demo Section — Dashboard Preview */}
					<Demo />

					{/* Pricing Section */}
					<Pricing />

					{/* Tech Section */}
					<Tech />

					{/* Footer - At the bottom */}
					<Footer />
				</div>
			</div>
		</main>
	);
}
