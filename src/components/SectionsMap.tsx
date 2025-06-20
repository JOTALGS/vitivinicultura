'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const secionsDict = {
  'UYAR': 'Artigas',
  'UYSA': 'San Jose',
  'UYPA': 'Paysandu',
  'UYRN': '--Rio Negro',
  'UYSO': 'Soriano',
  'UYCO': 'Colonia',
  'UYSJ': 'San Jose',
  'UYCA': 'Canelones',
  'UYMO': 'Montevideo',
  'UYFD': '--Florida',
  'UYDU': '--Durazno',
  'UYTA': '--Tacuarembo',
  'UYRV': 'Rivera',
  'UYFS': 'Flores',
  'UYCL': '--Cerro Largo',
  'UYTT': '--Treinta y Tres',
  'UYRO': 'Rocha',
  'UYMA': 'Maldonado',
  'UYLA': 'Lavalleja',
}

export default function SectionsMap() {
  const router = useRouter();

  useEffect(() => {
    const handleMapClick = (event: Event) => {
      const target = event.target as SVGElement | null;
      if (!target || !target.className || typeof target.className !== 'object') return;
      
      const className = target.className.baseVal;
      const regionCode = className.slice(-4);
      console.log('Region code:', regionCode);
      const EMPTY_REGIONS = ["UYTA", "UYDU", "UYCL", "UYTT", "UYRN", "UYSO", "UYFS", "UYLA", "UYFD"];

      // In your component or routing logic
      if (regionCode) {
        if (!EMPTY_REGIONS.includes(regionCode)) {
          router.push(`/enot-explora/${regionCode}`);
        }
        // Do nothing if regionCode is in SPECIAL_REGIONS
      }
    };

    const disableZoom = () => {
      // Hide zoom controls
      const zoomControls = document.querySelector<HTMLDivElement>('#map_zoom');
      console.log('@@@@@@@',zoomControls);
      if (zoomControls) {
        zoomControls.style.display = 'none';
      }

      // Disable touch zoom
      const mapElement = document.getElementById('map');
      console.log("@@@@@debug@@@@", mapElement);
      if (mapElement) {
        (mapElement as HTMLElement).style.touchAction = 'none';
      }

    };

    const applySizing = () => {
      const mapElement = document.getElementById('map');
      const svgElement = document.querySelector<SVGSVGElement>('#map_inner svg');
      const mapInner = document.querySelector<HTMLDivElement>('#map_inner');
      const mapInnerDiv = document.querySelector<HTMLDivElement>('#map_inner div:not([tt_sm_map])');
      if (mapInnerDiv) {
        mapInnerDiv.setAttribute('style', 'display: none !important');
      }

      if (svgElement) {
        svgElement.style.maxHeight = '10000px';
        svgElement.style.height = '100%';
        svgElement.style.width = 'auto';
      }
      
      if (mapInner) {
        mapInner.style.maxHeight = '1000px';
        mapInner.style.height = '100%';
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const mapInner = document.querySelector<HTMLDivElement>('#map_inner');
          if (mapInner) {
            applySizing();
            disableZoom();
            observer.disconnect();
          }
        }
      });
    });

    const mapdataScript = document.createElement('script');
    mapdataScript.src = '/maps/mapdata.js';
    mapdataScript.async = true;
    
    const worldmapScript = document.createElement('script');
    worldmapScript.src = '/maps/countrymap.js';
    worldmapScript.async = true;

    worldmapScript.onload = () => {
      const mapElement = document.getElementById('map');
      if (mapElement) {
        observer.observe(mapElement, { childList: true, subtree: true });
        
        setTimeout(() => {
          applySizing();
          disableZoom();
        }, 300);
        
        mapElement.addEventListener('click', handleMapClick);
      }
    };

    document.body.appendChild(mapdataScript);
    document.body.appendChild(worldmapScript);

    return () => {
      observer.disconnect();
      const mapElement = document.getElementById('map');
      if (mapElement) {
        mapElement.removeEventListener('click', handleMapClick);
      }
      document.body.removeChild(mapdataScript);
      document.body.removeChild(worldmapScript);
    };
  }, [router]);

  return (
    <div 
      id="map" 
      className='mt-[100px]' 
      style={{ 
        width: '100%', 
        height: '100%',
        overflow: 'hidden',
        touchAction: 'none' // Initial touch action disable
      }}
    >
      {/* Inline styles to ensure zoom controls are hidden */}
      <style jsx global>{`
        .map_zoom {
          display: none !important;
        }
      `}</style>
    </div>
  );
}