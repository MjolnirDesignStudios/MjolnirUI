"use client";

import { useState, useEffect } from 'react';
import Navbar from './Navigation/Navbar';
import { FloatingNav } from './Navigation/FloatingNav';

export default function NavigationWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? <FloatingNav /> : <Navbar />;
}