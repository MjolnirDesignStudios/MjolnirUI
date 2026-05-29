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
   the above-the-fold paint is instant.

   NEXT.JS 16 NOTE: `ssr: false` is forbidden on next/dynamic in a
   Server Component (this file). We leave ssr at its default (true) —
   the perf win is preserved because LazyMount returns its placeholder
   on both SSR + first client paint until IntersectionObserver fires.
   The dynamic chunks still code-split out of the initial bundle. */
const About = dynamic(() => import('@/components/About'));
const Build = dynamic(() => import('@/components/Build'));
const Demo = dynamic(() => import('@/components/Demo'));
const Pricing = dynamic(() => import('@/components/Pricing'));
const Tech = dynamic(() => import('@/components/Tech'));

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
