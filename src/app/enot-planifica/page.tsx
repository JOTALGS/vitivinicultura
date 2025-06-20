'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import Card from '@/components/Card';
import Cookies from "js-cookie";
import emailjs from '@emailjs/browser';
import ItinerarySender from '@/components/ItinerarySender';

const CategoryCarousel = ({ category, items }) => {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  return (
    <div className="mb-2 p-4 relative group">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="w-3 md:w-8 h-10 md:h-12 bg-mvd-sand mr-4"></div>
          <h2 className="font-bold text-mvd-sand text-2xl md:text-4xl">{category}</h2>
        </div>
        <div className="flex space-x-2">
          <button
            ref={navigationPrevRef}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-30"
            aria-label={`Previous ${category} items`}
          >
            ←
          </button>
          <button
            ref={navigationNextRef}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-30"
            aria-label={`Next ${category} items`}
          >
            →
          </button>
        </div>
      </div>

      <div className='bg-[#a3324e] !p-4'>
        <Swiper
          modules={[Navigation, Mousewheel, FreeMode]}
          navigation={{
            prevEl: navigationPrevRef.current,
            nextEl: navigationNextRef.current,
          }}
          onInit={(swiper) => {
            // Override navigation refs after init
            swiper.params.navigation.prevEl = navigationPrevRef.current;
            swiper.params.navigation.nextEl = navigationNextRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
          }}
          mousewheel={{
            forceToAxis: true,
            invert: false,
          }}
          freeMode={{
            enabled: true,
            momentum: true,
            momentumBounce: false,
            momentumRatio: 1,
            momentumVelocityRatio: 1,
          }}
          slidesPerView="auto"
          spaceBetween={16}
          resistance={true}
          resistanceRatio={0.85}
          watchOverflow={true}
          centerInsufficientSlides={true}
          className="!overflow-hidden"
        >
          {items?.map((lugar) => (
            <SwiperSlide key={lugar.entity_index} className="!w-fit">
              <div className="w-64">
                <Card
                  placeId={lugar.entity_index}
                  imageUrl={lugar.images}
                  title={lugar.name}
                  address={lugar.como_llegar}
                  description={lugar.extended_description}
                  services={lugar.servicios}
                  contact={lugar.datos_de_contacto}
                  coordinates={{
                    lat: lugar.coordinates?.[0],
                    lng: lugar.coordinates?.[1],
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};


type Entity = {
  name: string;
  servicios: string[];
  datos_de_contacto: string[];
  como_llegar: string[];
  images: { src: string; alt: string; title: string }[];
  contact_info: {
    email: string;
    website: string;
  };
  services: string[];
  downloaded_images: { src: string; alt: string; title: string }[];
  entity_index: number;
  entity_key: string;
  extended_description: string;
  events: {
    event_link: string;
    image_url: string;
    image_alt: string;
    local_image_path: string;
    title: string;
    description: string;
    date: string;
    location: string;
  }[];
  coordinates: [number, number];
  geocoding_info: {
    display_name: string;
    source: string;
  };
};

type LocationData = {
  total_entities: number;
  entities: Entity[];
};

type DepartamentoDict = Record<string, Entity[]>;


export default function HomePage() {
  const [locations, setLocations] = useState<Entity[] | DepartamentoDict>([]);
  const [extendedLocations, setExtendedLocations] = useState<Entity[] | DepartamentoDict>([]);
  const [sendStatus, setSendStatus] = useState<null | 'success' | 'error'>(null);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/entities_with_coords.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: LocationData = await response.json();
        
        // Get favorites from cookies
        const rawFavorites = Cookies.get("favoritos");
        let favoriteIds: string[] = [];
        
        try {
          const favorites = rawFavorites ? JSON.parse(decodeURIComponent(rawFavorites)) : [];
          favoriteIds = favorites.map((fav: {place_id: string}) => fav.place_id);
        } catch (error) {
          console.error('Error parsing favorites:', error);
        }

        const validLocations = data.entities.filter(entity => {
          // First check coordinates are valid
          const hasValidCoordinates = 
            entity.coordinates && 
            entity.coordinates.length === 2 &&
            !isNaN(entity.coordinates[0]) && 
            !isNaN(entity.coordinates[1]);
          
          return hasValidCoordinates;
        });

        console.log('Valid locations:', validLocations);
        
        setExtendedLocations(validLocations)

        const favLocations = data.entities.filter(entity => {
          // Only include if it's in favorites (if favorites exist)
          const isInFavorites = favoriteIds.length === 0 || favoriteIds.includes(entity.entity_index);
          
          return isInFavorites;
        });

        // Define all possible departamentos
        const departamentos = [
          'Artigas', 'Salto', 'Paysandu', 'Rio Negro', 'Soriano', 'Colonia', 
          'San Jose', 'Canelones', 'Montevideo', 'Florida', 'Durazno', 
          'Tacuarembo', 'Rivera', 'Flores', 'Cerro Largo', 'Treinta y Tres', 
          'Rocha', 'Maldonado', 'Lavalleja'
        ];

        // Create dictionary to hold locations by departamento
        const locationsByDepartamento: Record<string, typeof favLocations> = {};

        // Initialize with empty arrays for each departamento
        departamentos.forEach(depto => {
          locationsByDepartamento[depto] = [];
        });

        // Process each valid location
        favLocations.forEach(location => {
          // Find departamento in como_llegar
          let foundDepartamento = '';
          
          if (location.como_llegar) {
            for (const item of location.como_llegar) {
              // Look for any departamento name in the string
              const matchingDepto = departamentos.find(depto => 
                item.toLowerCase().includes(depto.toLowerCase())
              );
              
              if (matchingDepto) {
                foundDepartamento = matchingDepto;
                break;
              }
            }
          }

          // If we found a departamento, add to the corresponding array
          if (foundDepartamento && locationsByDepartamento[foundDepartamento]) {
            locationsByDepartamento[foundDepartamento].push(location);
          } else {
            // Handle cases where departamento isn't found (optional)
            if (!locationsByDepartamento['Unknown']) {
              locationsByDepartamento['Unknown'] = [];
            }
            locationsByDepartamento['Unknown'].push(location);
          }
        });

        console.log('Filtered locations by departamento:', locationsByDepartamento);
        setLocations(locationsByDepartamento);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  return (
    <main style={{ height: '200vh' }} className='flex flex-col bg-[#a3324e]'>
      <div className='' style={{ width: '100%', height: '50%', position: 'relative' }}>
        <Image
          src="/images/PLANIFICA.jpg"
          alt="Logo"
          fill
          className="object-cover"
        />
        <p 
          style={{ 
            fontFamily: 'Aptos',
            fontWeight: '800',
            fontSize: '60px',
            textShadow: `
              -3px -3px 0 #000,
              3px -3px 0 #000,
              -3px 3px 0 #000,
              3px 3px 0 #000
            `,
          }}
          className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] text-center text-white text-2xl md:text-4xl font-bold'
        >
          Planifica tu ruta de enoturismo eligiendo los destinos que prefieras y envía tu itinerario por mail en un solo clic.
        </p>
      </div>

      <div style={{ width: '100%', height: '50%' }}>
        <div className='relative mt-8'>
        {
          Object.entries(locations)
            // Filter out empty departamentos
            .filter(([_, entities]) => entities.length > 0)
            // Extract all entities into a single flat array
            .flatMap(([_, entities]) => entities)
            // Pass all entities to a single CategoryCarousel
            .length > 0 && (
              <CategoryCarousel
                key="all-bodegas" // Unique key
                category="Bodegas" // Fixed category name
                items={
                  Object.entries(locations)
                    .filter(([_, entities]) => entities.length > 0)
                    .flatMap(([_, entities]) => entities)
                }
              />
            )
        }
        </div>
        <div className="text-center">
          <ItinerarySender locations={extendedLocations}/>
        </div>
      </div>

    </main>
  );
}