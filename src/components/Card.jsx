"use client";
import Image from "next/image";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function Card({ placeId, imageUrl, title, address, description, services, contact, coordinates }) {

  const [isFav, setIsFav] = useState(false);

  // Al cargar el componente, verificar si ya está en favoritos
  useEffect(() => {
    const raw = Cookies.get("favoritos");
    if (raw) {
      try {
        const favs = JSON.parse(decodeURIComponent(raw));
        if (Array.isArray(favs) && favs.includes(placeId)) {
          setIsFav(true);
        }
      } catch (err) {
        console.error("❌ Error parseando favoritos:", err.message);
      }
    }
  }, [placeId]);

  // Alternar favorito
  const toggleFav = () => {
    const raw = Cookies.get("favoritos");
    let favs = [];
  
    try {
      favs = raw ? JSON.parse(decodeURIComponent(raw)) : [];
    } catch {
      favs = [];
    }
  
    const isAlreadyFav = favs.some(f => f.place_id === placeId);
  
    let updatedFavs;
  
    if (isAlreadyFav) {
      updatedFavs = favs.filter(f => f.place_id !== placeId);
      setIsFav(false);
    } else {
      updatedFavs = [...favs, placeId];
      const nuevoLugar = {
        place_id: placeId,
        name: title,
        address,
        coordinates,
      };

      const existingData = localStorage.getItem("favorito_data");
      const parsedData = existingData ? JSON.parse(existingData) : [];

      localStorage.setItem("favorito_data", JSON.stringify([...parsedData, nuevoLugar]));

      setIsFav(true);
    }
  
    console.log('selected favs', updatedFavs)
    Cookies.set("favoritos", JSON.stringify(updatedFavs), { expires: 30 });
  };
  

  return (
    <div className="flex flex-col justify-between max-w-sm rounded-sm md:min-h-[500px] md:min-w-[250px] border border-gray-300 overflow-hidden shadow-md bg-white transition hover:shadow-lg relative">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl.length > 0 ? imageUrl[0].src : 'https://via.placeholder.com/150'}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-semibold leading-snug mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-2">{`${description.split(' ').slice(0, 50).join(' ')}...`}</p>
      </div>
    </div>
  );
}
