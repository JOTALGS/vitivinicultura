// src/types.ts
export type LocationBase = {
  entity_index: string | number;
  name: string;
  coordinates: number[];
  extended_description: string;
  services: string | string[];
};

export type ItineraryLocation = LocationBase & {
  address: string;
  contact: string;
  image: string;
};

export type Entity = LocationBase & {
  servicios: string[];
  datos_de_contacto: string[];
  como_llegar: string[];
  images: { src: string; alt: string; title: string }[];
  contact_info: {
    email: string;
    website: string;
  };
  downloaded_images: { src: string; alt: string; title: string }[];
  entity_key: string;
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
  geocoding_info: {
    display_name: string;
    source: string;
  };
};