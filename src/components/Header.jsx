'use client';
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import NavButtons from "./NavButtons";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [idioma, setIdioma] = useState('es');
  const [isHidden, setIsHidden] = useState(false);
  const headerRef = useRef(null);
  const hoverZoneRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  
  // Control variable - set this to false to disable the auto-hide behavior
  const enableAutoHide = pathname === '/';

  useEffect(() => {
    const langFromCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('lang='))
      ?.split('=')[1];
    if (langFromCookie) {
      setCurrentLanguage(langFromCookie);
    }
  }, []);

  // Cargar el idioma guardado al iniciar
  useEffect(() => {
    const guardado = localStorage.getItem('idioma') || 'es';
    setIdioma(guardado);
  }, []);

  const handleChange = (e) => {
    const nuevo = e.target.value;
    setIdioma(nuevo);
    localStorage.setItem('idioma', nuevo);
  };

  // Set up auto-hide effect
  useEffect(() => {
    if (!enableAutoHide) return;

    const startHideTimer = () => {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        setIsHidden(true);
      }, 2000); // Hide after 2 seconds
    };

    startHideTimer();

    const handleMouseEnter = () => {
      clearTimeout(hideTimeoutRef.current);
      setIsHidden(false);
    };

    const handleMouseLeave = () => {
      startHideTimer();
    };

    // Add event listeners to the hover zone
    const hoverZone = hoverZoneRef.current;
    if (hoverZone) {
      hoverZone.addEventListener('mouseenter', handleMouseEnter);
      hoverZone.addEventListener('mouseleave', handleMouseLeave);
    }

    // Also keep the header visible when hovering over it
    const headerElement = headerRef.current;
    if (headerElement) {
      headerElement.addEventListener('mouseenter', handleMouseEnter);
      headerElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      clearTimeout(hideTimeoutRef.current);
      if (hoverZone) {
        hoverZone.removeEventListener('mouseenter', handleMouseEnter);
        hoverZone.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (headerElement) {
        headerElement.removeEventListener('mouseenter', handleMouseEnter);
        headerElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [enableAutoHide]);

  return (
    <>
      {/* Invisible hover zone at top of screen */}
      <div
        ref={hoverZoneRef}
        className="fixed top-0 left-0 w-full h-[10vh] z-40 bg-transparent pointer-events-auto"
        style={{ display: isHidden ? 'block' : 'none' }}
      />

      <header 
        ref={headerRef}
        className={`min-w-[100%] border-b-2 border-[#a3324e] bg-white/40 relative z-50 transition-transform duration-500 ease-in-out ${
          isHidden && enableAutoHide ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="custom-container">
          <div className="flex items-center justify-between px-2 sm:px-4 py-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo_INAVI.svg"
                alt="Logo"
                width={300}
                height={300}
                sizes="(min-width: 768px) 300px, 180px"
                className="h-auto w-auto max-w-[180px] md:max-w-[300px]"
              />
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden relative w-14 h-14 flex items-center justify-center z-78"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span
                className={`absolute w-6 h-0.5 bg-[#e91e8b] transition-transform duration-500 ease-in-out ${
                  isMenuOpen ? 'rotate-45' : '-translate-y-2'
                }`}
              />
              <span
                className={`absolute w-6 h-0.5 bg-[#e91e8b] transition-opacity duration-500 ease-in-out ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`absolute w-6 h-0.5 bg-[#e91e8b] transition-transform duration-500 ease-in-out ${
                  isMenuOpen ? '-rotate-45' : 'translate-y-2'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Menú desktop */}
        <div className="hidden md:block">
          <NavButtons />
        </div>

        {/* Menú mobile full screen */}
        <div
          className={`fixed inset-0 z-50 bg-white transform transition-transform duration-500 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          } md:hidden`}
        >
          <div className="p-6 pr-18 md:pr-6 flex flex-col gap-6 text-black font-bold text-xl">
            {/* Mobile top info */}
            <div className="flex flex-col gap-3 text-gray-500 text-base font-normal">
              <div className="flex items-center gap-6 flex-wrap">
                <select
                  value={currentLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>

            {/* Mobile links */}
            <Link href="/planifica" onClick={() => setIsMenuOpen(false)}>Planifica</Link>
            <Link href="/explora" onClick={() => setIsMenuOpen(false)}>Explora</Link>
          </div>
        </div>
      </header>
    </>
  );
}