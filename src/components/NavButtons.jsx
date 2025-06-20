'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const navItems = [
  { label: "Explora", href: "/enot-explora", color: "#C97A95" },
  { label: "Planifica", href: "/enot-planifica", color: "#F2E6CE" },
  { label: "Agenda", href: "/enot-agenda", color: "#722F37" },
];
const NavButtons = () => {
  const pathname = usePathname();
  const navContainerRef = useRef(null);
  const indicatorRef = useRef(null);
  const buttonRefs = useRef([]);
  const previousIndexRef = useRef(null);

  useEffect(() => {
    const activeIndex = navItems.findIndex(item => item.href === pathname);
    const targetButton = buttonRefs.current[activeIndex];

    if (
      targetButton &&
      indicatorRef.current &&
      navContainerRef.current &&
      activeIndex !== -1
    ) {
      const { offsetLeft, offsetWidth } = targetButton;
      const activeColor = navItems[activeIndex].color;

      let fromLeft = 0;
      let fromWidth = 0;

      // Get initial position if this is the first render or no previous index
      if (previousIndexRef.current !== null && previousIndexRef.current !== activeIndex) {
        const prevButton = buttonRefs.current[previousIndexRef.current];
        if (prevButton) {
          fromLeft = prevButton.offsetLeft;
          fromWidth = prevButton.offsetWidth;
        }
      } else {
        // First time or same index, start from current position
        fromLeft = offsetLeft;
        fromWidth = offsetWidth;
      }

      const indicator = indicatorRef.current;
      const container = navContainerRef.current;

      // Set initial indicator position and make it visible
      gsap.set(indicator, {
        left: fromLeft,
        width: fromWidth,
        backgroundColor: activeColor,
        display: 'block'
      });

      // Animate indicator with active color
      gsap.to(indicator, {
        left: offsetLeft,
        width: offsetWidth,
        duration: 0.4,
        ease: 'power2.out',
        backgroundColor: activeColor,
      });

      // Animate full nav container fade-in only on home route
      if (pathname === '/') {
        gsap.set(container, { opacity: 0 });
        gsap.to(container, {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          delay: 2.5,
        });
      } else {
        // Ensure opacity is reset immediately on other routes
        gsap.set(container, { opacity: 1 });
      }

      previousIndexRef.current = activeIndex;
    } else if (activeIndex === -1 && indicatorRef.current) {
      // Hide indicator if no active route matches
      gsap.set(indicatorRef.current, { display: 'none' });
    }
  }, [pathname]);

  return (
      <div className="border-t-2 border-[#a3324e] bg-transparent relative">
        <nav className="custom-container">
          <div 
            ref={navContainerRef}
            className="relative grid grid-cols-3 justify-center sm:justify-between items-center w-full text-center px-0 sm:px-4"
          >
            {/* Sliding GSAP indicator */}
            <div
              ref={indicatorRef}
              className="absolute top-0 bottom-0 left-0 w-10 z-[1] transition-colors duration-400"
            />
              {/* Nav Items */}
              {navItems.map(({ label, href }, index) => (
                <Link
                  key={label}
                  href={href}
                  ref={(el) => (buttonRefs.current[index] = el)}
                  className={`relative z-[10] text-lg sm:text-2xl font-semibold cursor-pointer transition-colors py-2 w-full px-0 sm:px-8 ${
                    pathname === href ? 'text-white' : 'text-black hover:text-sky-400'
                  }`}
                >
                  <span className="relative z-[10]">
                    {label}
                  </span>
                </Link>
              ))}
          </div>
        </nav>
      </div>
  );
};

export default NavButtons;
