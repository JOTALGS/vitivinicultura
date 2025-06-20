'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Fix Leaflet's default icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/mappin.png',
  iconUrl: '/images/mappin.png',
  shadowUrl: '/images/mappin.png',
});

const initialView = {
  center: [-33.0, -56.0],
  zoom: 7
};

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

export default function LocationDrawer({
  activeLocation,
  locations,
  handleLocationClick
}) {
  return (
    <div className="flex relative h-full min-h-[90vh] w-[20%]">
      {/* Permanent Left Drawer */}
      <div className="p-4 bg-[#C97A95] h-full shadow-md z-[1000] overflow-y-auto">
        <div className='flex flex-row items-start'>
          <h3 className="mt-0 mb-6 text-[30px] font-semibold text-[#722F37] uppercase">Bodegas Y Viñedos </h3>
          <div className='flex flex-col'>
            <Link
              href={'/enot-planifica'}
              className="relative z-[10] text-sm cursor-pointer transition-colors py-2 text-black hover:bg-orange-400/50 p-2 rounded-md"
            >
              <span className="relative z-[10]">
                Ve a tu selección
              </span>
            </Link>
            <Link
              href={'/enot-explora'}
              className="relative z-[10] text-sm cursor-pointer transition-colors py-2 text-black  hover:bg-red-400/50 p-2 rounded-md"
            >
              <span className="relative z-[10]">
                Volver
              </span>
            </Link>
          </div>
        </div>

        <ul className="list-none p-0">
          {locations.map((location) => (
            <li key={location.entity_key} className="hover:bg-[#bfb53d]/40">
              <button
                onClick={() => handleLocationClick(location)}
                className={`w-full px-4 py-3 text-left cursor-pointer border-b border-[#bfb53d] transition-all duration-200 text-sm flex items-center
                  ${activeLocation?.entity_key === location.entity_key ? 'bg-[#bfb53d]/60 font-bold' : 'bg-transparent font-normal'}
                `}
              >
                <span className="ml-2 text-[#e9e9e9] text-transform: uppercase">{location.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}