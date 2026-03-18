import ShaderBG_Type1 from '@/components/ShaderBG_Type1';
import NavigationWrapper from '@/components/NavigationWrapper';
import Footer from '@/components/Footer';
import Pricing from '@/components/Pricing';

export default function PricingPage() {
	return (
		<main className="relative min-h-screen overflow-x-hidden">
			{/* Background Layer - Shader BG behind everything */}
			<ShaderBG_Type1 />

			{/* Navigation Layer - Above BG, below content */}
			<NavigationWrapper />

			{/* Content Layer - Above BG and Nav, main page content */}
			<div className="relative z-10">
				<div className="bg-transparent w-full">
					{/* Pricing Section */}
					<Pricing />

					{/* Footer - At the bottom */}
					<Footer />
				</div>
			</div>
		</main>
	);
}