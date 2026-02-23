import ShaderBG_Type1 from '@/components/ShaderBG_Type1';
import Navbar_V2 from '@/components/Navigation/Navbar_V2';
import { FloatingNav } from '@/components/Navigation/FloatingNav';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Blocks from '@/components/Blocks';
import Pricing from '@/components/Pricing';

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
			<Navbar_V2 />

			{/* Content Layer - Above BG and Nav, main page content */}
			<div className="relative z-10">
				<div className="bg-transparent w-full">
					{/* Hero Section */}
					<Hero />

					{/* Blocks Section */}
					<Blocks />

					{/* Pricing Section */}
					<Pricing />

					{/* Footer - At the bottom */}
					<Footer />
				</div>
			</div>
		</main>
	);
}
