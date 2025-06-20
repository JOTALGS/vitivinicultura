'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useMemo, useCallback } from 'react';
import LocationDrawer from './locationDrawer';
import { useSectionFromUrl } from '@/hooks/useSectionFromUrl';
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import Cookies from "js-cookie";

// Constants
const COMPOSITE_SECTIONS = {
  'UYLN': ['Artigas', 'Salto', 'Paysandu'],
  'UYLS': ['Rio Negro', 'Soriano', 'Colonia'],
  'UYMT': ['San Jose', 'Canelones', 'Montevideo'],
  'UYCT': ['Florida', 'Durazno'],
  'UYCE': ['Treinta y Tres', 'Lavalleja'],
  'UYNO': ['Tacuarembo', 'Rivera'],
  'UYOC': ['Rocha', 'Maldonado']
};

const SECTIONS_DICT = {
  'UYAR': 'Artigas',
  'UYSA': 'Salto',
  'UYPA': 'Paysandu',
  'UYRN': 'Rio Negro',
  'UYSO': 'Soriano',
  'UYCO': 'Colonia',
  'UYSJ': 'San Jose',
  'UYCA': 'Canelones',
  'UYMO': 'Montevideo',
  'UYFD': 'Florida',
  'UYDU': 'Durazno',
  'UYTA': 'Tacuarembo',
  'UYRV': 'Rivera',
  'UYFS': 'Flores',
  'UYCL': 'Cerro Largo',
  'UYTT': 'Treinta y Tres',
  'UYRO': 'Rocha',
  'UYMA': 'Maldonado',
  'UYLA': 'Lavalleja'
};

const SECTION_CENTERS = {
  'UYAR': [-30.709876653046706, -56.86943878972716],
  'UYSA': [-31.36900967052479, -57.115297355900275],
  'UYPA': [-32.05039210201965, -57.252627370323445],
  'UYLN': [-31.290113902574134, -57.05287050799728],
  'UYRN': [-32.72980686519735, -57.38233726087798],
  'UYSO': [-33.45754479007589, -57.83236949010626],
  'UYCO': [-34.171377872283585, -57.649277767006815],
  'UYLS': [-34.171377872283585, -57.649277767006815],
  'UYSJ': [-34.31334119292966, -56.73460782773723],
  'UYCA': [-34.542029947265064, -55.980558397331734],
  'UYMO': [-34.79427209660696, -56.157257079543854],
  'UYMT': [-34.79427209660696, -56.157257079543854],
  'UYFD': [-33.86149451370998, -55.93840221447036],
  'UYDU': [-33.09939948039996, -56.0491736230023],
  'UYCT': [-33.09939948039996, -56.0491736230023],
  'UYTT': [-33.08138408650373, -54.28966975594243],
  'UYLA': [-33.971079973452625, -55.03967813429362],
  'UYCE': [-33.971079973452625, -55.03967813429362],
  'UYTA': [-32.13947913009105, -55.74793661792182],
  'UYRV': [-31.512080626115008, -55.27744852013385],
  'UYNO': [-31.512080626115008, -55.27744852013385],
  'UYFS': [-33.585168068023904, -56.863076382556905],
  'UYCL': [-32.466343104732836, -54.53558462828391],
  'UYRO': [-33.99758427775808, -54.056701094172475],
  'UYMA': [-34.66178175587172, -54.96895766227902],
  'UYOC': [-34.66178175587172, -54.96895766227902]
};

// Configure Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/mappin.png',
  iconUrl: '/images/mappin.png',
  shadowUrl: '/images/mappin.png',
});

// Helper function
const getInitialView = (sectionCode) => {
  if (sectionCode === 'UYMO') {
    return {
      center: (SECTION_CENTERS[sectionCode] || [-34.90, -56.16]),
      zoom: 10
    };
  } else if (new Set(['UYLN', 'UYLS', 'UYMT', 'UYCT', 'UYCE', 'UYNO', 'UYOC']).has(sectionCode)) {
    return {
      center: (SECTION_CENTERS[sectionCode] || [-34.90, -56.16]),
      zoom: 8
    };
  } else if (['UYFAL', 'UYFEV', 'UYFTI', 'UYFRE', 'UYFTY'].some(code => 
      new RegExp(`\\b${code}\\b`).test(sectionCode)
  )) {
      return {
          center: [-32.69184815877728, -56.02980607969865],
          zoom: 7
      };
  }
  return {
    center: (SECTION_CENTERS[sectionCode] || [-34.90, -56.16]),
    zoom: 9
  };
};

// Helper Components
function ChangeView({ center, zoom, duration = 2000 }) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: duration / 1000,
      easeLinearity: 0.25,
      noMoveStart: true
    });
  }, [center, zoom, duration, map]);

  return null;
}

function ServiceIcon({ service }) {
  switch (true) {
    case service.includes('Tienda'):
      return (
        <svg fill='#a3324e' xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 576 512">
          <path d="M547.6 103.8L490.3 13.1C485.2 5 476.1 0 466.4 0L109.6 0C99.9 0 90.8 5 85.7 13.1L28.3 103.8c-29.6 46.8-3.4 111.9 51.9 119.4c4 .5 8.1 .8 12.1 .8c26.1 0 49.3-11.4 65.2-29c15.9 17.6 39.1 29 65.2 29c26.1 0 49.3-11.4 65.2-29c15.9 17.6 39.1 29 65.2 29c26.2 0 49.3-11.4 65.2-29c16 17.6 39.1 29 65.2 29c4.1 0 8.1-.3 12.1-.8c55.5-7.4 81.8-72.5 52.1-119.4zM499.7 254.9c0 0 0 0-.1 0c-5.3 .7-10.7 1.1-16.2 1.1c-12.4 0-24.3-1.9-35.4-5.3L448 384l-320 0 0-133.4c-11.2 3.5-23.2 5.4-35.6 5.4c-5.5 0-11-.4-16.3-1.1l-.1 0c-4.1-.6-8.1-1.3-12-2.3L64 384l0 64c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-64 0-131.4c-4 1-8 1.8-12.3 2.3z"/>
        </svg>
      );
    case service.includes('Tour'):
      return (
        <svg fill='#a3324e' xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 320 512">
          <path d="M32.1 29.3C33.5 12.8 47.4 0 64 0L256 0c16.6 0 30.5 12.8 31.9 29.3l14 168.4c6 72-42.5 135.2-109.9 150.6l0 99.6l48 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-80 0-80 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l48 0 0-99.6C60.6 333 12.1 269.8 18.1 197.8l14-168.4zm56 98.7l143.8 0-5.3-64L93.4 64l-5.3 64z"/>
        </svg>  
      );
    case service.includes('Restaurant'):
      return (
        <svg fill='#a3324e' xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 448 512">
          <path d="M416 0C400 0 288 32 288 176l0 112c0 35.3 28.7 64 64 64l32 0 0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 0-112 0-208c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7L80 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-224.4c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16l0 134.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8L64 16zm48.3 152l-.3 0-.3 0 .3-.7 .3 .7z"/>
        </svg>  
      );
    case service.includes('Alojamiento'):
      return (
        <svg fill='#a3324e' xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 640 512">
          <path d="M32 32c17.7 0 32 14.3 32 32l0 256 224 0 0-160c0-17.7 14.3-32 32-32l224 0c53 0 96 43 96 96l0 224c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-32-224 0-32 0L64 416l0 32c0 17.7-14.3 32-32 32s-32-14.3-32-32L0 64C0 46.3 14.3 32 32 32zm144 96a80 80 0 1 1 0 160 80 80 0 1 1 0-160z"/>
        </svg>
      );
    default:
      return null;
  }
}

// Main Component
export default function Map() {
  const sectionCode = useSectionFromUrl();
  const [currentView, setCurrentView] = useState(() => getInitialView(sectionCode));
  const [activeLocation, setActiveLocation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [favs, setFavs] = useState([]);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch('/entities_with_coords.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const parts = sectionCode.split('-');
      const serviceCodes = ['UYFAL', 'UYFEV', 'UYFTI', 'UYFRE', 'UYFTY'];
      const serviceParts = [...new Set(parts.filter(part => serviceCodes.includes(part)))];

      const validLocations = data.entities.filter(entity => {
        // Validate coordinates
        if (!entity.coordinates || entity.coordinates.length !== 2 || 
            isNaN(entity.coordinates[0]) || isNaN(entity.coordinates[1])) {
          return false;
        }
        
        // Service filters (if any service codes present)
        if (serviceParts.length > 0) {
          return serviceParts.every(servicePart => {
            switch (servicePart) {
              case 'UYFAL': 
                return entity.servicios?.some(service => 
                  service.toLowerCase().includes('alojamiento')
                ) ?? false;
              case 'UYFEV':
                return (Array.isArray(entity.events) && entity.events.length > 0) || 
                      (typeof entity.events === 'number' && entity.events > 0);
              case 'UYFTI':
                return entity.servicios?.some(service => 
                  service.toLowerCase().includes('tienda')
                ) ?? false;
              case 'UYFRE':
                return entity.servicios?.some(service => 
                  service.toLowerCase().includes('restaurante')
                ) ?? false;
              case 'UYFTY':
                const lowerName = entity.name?.toLowerCase() || '';
                return lowerName.includes('bodega') || lowerName.includes('viñedo');
              default:
                return true;
            }
          });
        }
        
        // Original location filters (only if no service codes)
        const sectionName = SECTIONS_DICT[sectionCode];
        const isComposite = COMPOSITE_SECTIONS[sectionCode];

        if (isComposite) {
          return isComposite.some(location => 
            entity.como_llegar?.some(text => 
              text.toLowerCase().includes(location.toLowerCase())
            )
          );
        }
        
        return entity.como_llegar?.some(text => 
          text.toLowerCase().includes(sectionName.toLowerCase())
        );
      });
      
      setLocations(validLocations);
    } catch (err) {
      console.error('Error loading locations:', err);
      setError('Failed to load location data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [sectionCode]);

  const handleLocationClick = useCallback((location) => {
    if (activeLocation?.entity_key === location.entity_key) {
      setCurrentView(getInitialView(sectionCode));
      setActiveLocation(null);
      setShowDetails(false);
    } else {
      setCurrentView({
        center: location.coordinates,
        zoom: 15
      });
      setActiveLocation(location);
      setShowDetails(true);
    }
  }, [activeLocation, sectionCode]);

  const closeDetailsPanel = useCallback(() => {
    setShowDetails(false);
    setActiveLocation(null);
    setCurrentView(getInitialView(sectionCode));
  }, [sectionCode]);

  const toggleFav = useCallback((location) => {
    if (!location?.entity_index) return;

    const isAlreadyFav = favs.some(f => f.place_id === location.entity_index);
    let updatedFavs;

    if (isAlreadyFav) {
      updatedFavs = favs.filter(f => f.place_id !== location.entity_index);
    } else {
      updatedFavs = [...favs, {
        place_id: location.entity_index,
        name: location.name,
      }];
    }

    setFavs(updatedFavs);
    Cookies.set("favoritos", JSON.stringify(updatedFavs), { expires: 30 });
    localStorage.setItem("favorito_data", JSON.stringify(updatedFavs));
  }, [favs]);

  // Effects
  useEffect(() => {
    // Initialize favorites from cookies
    const raw = Cookies.get("favoritos");
    try {
      const initialFavs = raw ? JSON.parse(decodeURIComponent(raw)) : [];
      setFavs(initialFavs);
    } catch {
      setFavs([]);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Memoized values
  const isCurrentFav = useMemo(() => {
    return favs.some(f => f.place_id === activeLocation?.entity_index);
  }, [favs, activeLocation]);

  const markerIcon = useMemo(() => {
    return new L.Icon({
      iconUrl: '/images/mappin.png',
      iconSize: [15, 20],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }, []);

  // Render states
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[850px]">
        <div className="text-xl">Loading map data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[850px]">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (locations.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-[850px]">
        <div className="text-xl">No location data available</div>
      </div>
    );
  }

  return (
    <div className="flex w-full relative h-[100%] bg-[#a3324e]">
      <LocationDrawer
        activeLocation={activeLocation}
        locations={locations}
        handleLocationClick={handleLocationClick}
      />

      <div className={`flex-1 transition-all duration-300 ease-in-out ${showDetails ? 'mr-[30%]' : 'mr-0'}`}>
        <MapContainer
          center={getInitialView(sectionCode).center}
          zoom={getInitialView(sectionCode).zoom}
          className="w-full min-h-full transition-all duration-300 ease-in-out"
          scrollWheelZoom={true}
          zoomAnimation={true}
          zoomAnimationThreshold={1}
        >
          <ChangeView 
            center={currentView.center} 
            zoom={currentView.zoom} 
            duration={2000}
          />
          
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {locations
            .filter(location => !activeLocation || activeLocation.entity_key === location.entity_key)
            .map((location) => {
              const isSelected = activeLocation?.entity_key === location.entity_key;
              
              return (
                <Marker 
                  key={`${location.entity_key}-${location.coordinates.join('-')}`} 
                  position={location.coordinates}
                  icon={markerIcon}
                  opacity={1}
                  eventHandlers={{
                    click: () => handleLocationClick(location),
                  }}
                >
                  <Popup className={isSelected ? 'selected-popup' : ''}>
                    <div className="max-w-xs">
                      <h3 className={`font-bold uppercase ${isSelected ? 'text-lg' : 'text-sm'} mb-1`}>
                        {location.name}
                      </h3>
                      <p className={`${isSelected ? 'text-sm' : 'text-xs'} mb-1`}>
                        {location.geocoding_info?.display_name}
                      </p>
                      {location.servicios.length > 0 && (
                        <p className={`${isSelected ? 'text-sm' : 'text-xs'}`}>
                          Services: {location.servicios.slice(0, 2).join(', ')}
                          {location.servicios.length > 2 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>

      <DetailsPanel
        activeLocation={activeLocation}
        showDetails={showDetails}
        isCurrentFav={isCurrentFav}
        isExpanded={isExpanded}
        onClose={closeDetailsPanel}
        onToggleFav={toggleFav}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
      />
    </div>
  );
}


function EventsList({
  events
}) {
  // Handle different types of events data
  if (!events) {
    return <p className="text-gray-500 text-center py-4">No hay eventos proximamente</p>;
  }

  if (typeof events === 'number') {
    return (
      <p className="text-gray-700 text-center py-4">
        There are {events} upcoming events
      </p>
    );
  }

  if (events.length === 0) {
    return <p className="text-gray-500 text-center py-4">No hay eventos proximamente</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div 
          key={event.id}
          className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
        >
          {event.image_url && (
            <div className="flex justify-center bg-[#fcecce] p-2">
              <img
                src={event.image_url}
                alt={event.image_alt || event.title}
                className="object-contain max-h-80 w-full"
              />
            </div>
          )}
          <div className="p-4 bg-[#d0ad6e]">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                {event.date}
              </span>
            </div>
            <p className="mt-2 text-gray-600">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Sub-components
function DetailsPanel({
  activeLocation,
  showDetails,
  isCurrentFav,
  isExpanded,
  onClose,
  onToggleFav,
  onToggleExpand
}) {
  if (!activeLocation) return null;

  return (
    <div className={`overflow-x-hidden absolute right-0 top-0 w-[30%] h-[100%] bg-[#F2E6CE] border-l border-[#5dcbe8] shadow-lg transition-all duration-300 ease-in-out
      ${showDetails ? 'right-0' : '-right-[350px] bg-transparent'}
    `}>
      <div className="p-6 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="m-0 text-[25px] font-bold text-[#bfb53d] uppercase">{activeLocation.name}</h2>

          <button 
            onClick={onClose}
            className="bg-transparent border-none text-2xl cursor-pointer text-gray-600 hover:text-gray-800"
          >
            ×
          </button>
        </div>
        <div className='flex items-center gap-4'>
          <h3 className="mb-2 text-xl font-semibold text-[#aa3d3d]">
            {isCurrentFav ? "Quita esta ubicación de tus favoritos" : "Agrega esta ubicación a tus favoritos"}
          </h3>
          <button
            onClick={() => onToggleFav(activeLocation)}
            className="text-white text-2xl drop-shadow hover:scale-110 transition flex w-10 h-10 mt-1"
          >
            {isCurrentFav ? <MdFavorite className="text-[#aa3d3d]" /> : <MdFavoriteBorder className="text-wite hover:text-[#aa3d3d]" />}
          </button>
        </div>

        <LocationImage activeLocation={activeLocation} />
        
        <LocationDescription 
          description={activeLocation.extended_description}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        />
        
        <ServicesList services={activeLocation.servicios} />
        
        <LocationInfo 
          directions={activeLocation.como_llegar}
          contactInfo={activeLocation.contact_info}
          contactData={activeLocation.datos_de_contacto}
        />
        
        <EventsList events={activeLocation.events} />
      </div>
    </div>
  );
}


function LocationImage({ activeLocation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Reset index and images when location changes
    setCurrentIndex(0);
    
    // Safely handle images data
    if (activeLocation?.images && Array.isArray(activeLocation.images)) {
      setImages(activeLocation.images.filter(img => img?.src));
    } else {
      setImages([]);
    }
  }, [activeLocation]);

  if (!images || images.length === 0) {
    return (
      <div className="w-[96%] h-[330px] m-2 bg-gray-200 mb-6 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <p>No images available</p>
          <img 
            src="https://via.placeholder.com/350x150?text=Image+Not+Available" 
            alt="Placeholder"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentImage = images[currentIndex];

  return (
    <div className="w-[96%] max-h-[330px] m-2 bg-gray-200 mb-6 flex items-center justify-center overflow-hidden relative">
      {/* Main Image */}
      <img 
        src={currentImage.src} 
        alt={currentImage.alt || activeLocation.name || 'Location image'}
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={(e) => {
          (e.target).src = 'https://via.placeholder.com/350x150?text=Image+Not+Available';
        }}
      />
      
      {/* Navigation Arrows (only show if multiple images) */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/75 transition-all z-10"
            aria-label="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/75 transition-all z-10"
            aria-label="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
      
      {/* Image Counter/Dots (only show if multiple images) */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Image Counter Text */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-sm px-2 py-1 rounded z-10">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

function LocationDescription({
  description,
  isExpanded,
  onToggleExpand
}) {
  if (!description) return null;

  return (
    <div className="mb-6">
      <h3 className="mb-2 text-[25px] font-semibold text-[#bfb53d]">Descripción</h3>
      <div className="text-sm text-gray-800">
        {description.length <= 100 ? (
          <p>{description}</p>
        ) : (
          <>
            <p>{isExpanded ? description : `${description.split(' ').slice(0, 100).join(' ')}...`}</p>
            <button 
              onClick={onToggleExpand}
              className="mt-2 text-xs font-medium text-[#8c8856] hover:underline focus:outline-none"
            >
              {isExpanded ? 'Ver menos' : 'Ver más'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ServicesList({ services }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-[25px] font-semibold text-[#bfb53d]">Servicios</h3>
      <ul className="pl-5">
        {services.length > 0 ? (
          services.map((service, index) => (
            <div key={index} className='flex items-center justify-start py-1 gap-2 mb-2'>
              <ServiceIcon service={service} />
              <li className="list-none text-sm text-gray-800">{service}</li>
            </div>
          ))
        ) : (
          <li className="text-sm text-gray-800">No hay servicios especificados</li>
        )}
      </ul>
    </div>
  );
}

function LocationInfo({
  directions,
  contactInfo,
  contactData
}) {
  return (
    <>
      <div className="mb-6">
        <h3 className="mb-2 text-[25px] font-semibold text-[#bfb53d]">Locación</h3>
        <ul className="pl-5">
          {directions.length > 0 ? (
            directions.map((direction, index) => (
              <div key={index} className='flex items-center mb-2 gap-2'>
                {index===0 && <svg fill='#a3324e' xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 320 512"><path d="M16 144a144 144 0 1 1 288 0A144 144 0 1 1 16 144zM160 80c8.8 0 16-7.2 16-16s-7.2-16-16-16c-53 0-96 43-96 96c0 8.8 7.2 16 16 16s16-7.2 16-16c0-35.3 28.7-64 64-64zM128 480l0-162.9c10.4 1.9 21.1 2.9 32 2.9s21.6-1 32-2.9L192 480c0 17.7-14.3 32-32 32s-32-14.3-32-32z"/></svg>}
                {index===1 && <svg fill='#a3324e' xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 512 512"><path d="M256 0c17.7 0 32 14.3 32 32l0 34.7C368.4 80.1 431.9 143.6 445.3 224l34.7 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-34.7 0C431.9 368.4 368.4 431.9 288 445.3l0 34.7c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-34.7C143.6 431.9 80.1 368.4 66.7 288L32 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l34.7 0C80.1 143.6 143.6 80.1 224 66.7L224 32c0-17.7 14.3-32 32-32zM128 256a128 128 0 1 0 256 0 128 128 0 1 0 -256 0zm128-80a80 80 0 1 1 0 160 80 80 0 1 1 0-160z"/></svg>}
                {index===2 && <svg fill='#a3324e' xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 576 512"><path d="M302.8 312C334.9 271.9 408 174.6 408 120C408 53.7 354.3 0 288 0S168 53.7 168 120c0 54.6 73.1 151.9 105.2 192c7.7 9.6 22 9.6 29.6 0zM416 503l144.9-58c9.1-3.6 15.1-12.5 15.1-22.3L576 152c0-17-17.1-28.6-32.9-22.3l-116 46.4c-.5 1.2-1 2.5-1.5 3.7c-2.9 6.8-6.1 13.7-9.6 20.6L416 503zM15.1 187.3C6 191 0 199.8 0 209.6L0 480.4c0 17 17.1 28.6 32.9 22.3L160 451.8l0-251.4c-3.5-6.9-6.7-13.8-9.6-20.6c-5.6-13.2-10.4-27.4-12.8-41.5l-122.6 49zM384 255c-20.5 31.3-42.3 59.6-56.2 77c-20.5 25.6-59.1 25.6-79.6 0c-13.9-17.4-35.7-45.7-56.2-77l0 194.4 192 54.9L384 255z"/></svg>}
                <li className="text-sm text-gray-800">{direction}</li>
              </div>
            ))
          ) : (
            <li className="text-sm text-gray-800">No hay direcciones especificadas</li>
          )}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="mb-2 text-[25px] font-semibold text-[#bfb53d]">Información de Contacto</h3>
        <ul className="pl-5 text-gray-800">
          {contactData.length > 0 && contactData.map((contact, index) => {
            // Check if contact contains only phone number characters
            const isPhoneNumber = /^[\d\s+()\-]+$/.test(contact);
            
            return isPhoneNumber ? (
              <div key={index} className='flex items-center mb-2 gap-2'>
                <svg fill='#a3324e' xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 512 512">
                  <path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/>
                </svg>
                <li className="text-sm">{contact}</li>
              </div>
            ) : null;
          })}
          {contactInfo?.email && (
            <div className='flex items-center mb-2 gap-2'>
              <svg fill='#a3324e' xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
              <li className="text-sm">{contactInfo.email}</li>
            </div>
          )}
          {contactInfo?.website && (
            <div className='flex items-center mb-2 gap-2'>
              <svg fill='#a3324e' xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 640 512"><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg>
              <li className="text-sm">
                  <a href={contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {contactInfo.website}
                </a>
              </li>
            </div>
          )}
          {!contactData.length && !contactInfo?.email && !contactInfo?.website && (
            <li className="text-sm text-gray-800">Sin información de contacto disponible</li>
          )}
        </ul>
      </div>
    </>
  );
}