// utils/ClearFavoritosClient.js
"use client";
import { useEffect } from "react";


export default function ClearFavoritosClient() {
  useEffect(() => {
    document.cookie = "favoritos=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  }, []);

  return null;
}
