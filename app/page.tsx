import dynamic from 'next/dynamic';
import ShaderBG_Type1 from '@/components/ShaderBG_Type1';
import Navbar_V2 from '@/components/Navigation/Navbar_V2';
import { FloatingNav } from '@/components/Navigation/FloatingNav';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import { LazyMount } from '@/components/LazyMount';

/* Below-the-fold sections — dynamic imports keep them out of the
   initial bundle, and LazyMount waits until the user scrolls within
   400px before mounting + hydrating. Hero stays eagerly imported so
   the above-the-fold paint is instant. */
const About = dynamic(() => import('@/components/About'), { ssr: false });
const Build = dynamic(() => import('@/components/Build'), { ssr: false });
const Demo = dynamic(() => import('@/components/Demo'), { ssr: false });
const Pricing = dynamic(() => import('@/components/Pricing'), { ssr: false });
const Tech = dynamic(() => import('@/components/Tech'), { ssr: false });

export default function Home() {
	return (
		<main className="relative min-h-screen overflow-x-hidden">
			{/* Background Layer - Shader BG behind everything. Self-throttles
			    to 30fps and pauses when the user scrolls > 1.5 viewports
			    deep (see ShaderBG_Type1.tsx). */}
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
					{/* Hero — above-the-fold, mounts eagerly */}
					<Hero />

					{/* Everything below the fold is dynamic-imported and
					    LazyMount-gated. First paint stays light; sections
					    hydrate on demand as the user scrolls. */}
					<LazyMount>
						<About />
					</LazyMount>
					<LazyMount>
						<Build />
					</LazyMount>
					<LazyMount>
						<Demo />
					</LazyMount>
					<LazyMount>
						<Pricing />
					</LazyMount>
					<LazyMount>
						<Tech />
					</LazyMount>

					{/* Footer - At the bottom, kept eager since it's small. */}
					<Footer />
				</div>
			</div>
		</main>
	);
}
