'use client';

import { useEffect, useState } from 'react';

// Define types
type Event = {
  event_link: string;
  image_url: string;
  image_alt: string;
  local_image_path: string;
  title: string;
  description: string;
  date: string;
  location: string;
};

type Entity = {
  entity_index: string;
  name: string;
  coordinates: number[] | null;
  events: Event[];
  // Add other properties as needed
};

type LocationData = {
  entities: Entity[];
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/entities_with_coords.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data: LocationData = await response.json();
        
        // Filter entities with events and flatten events array
        const allEvents = data.entities
          .filter(entity => 
            entity.events && 
            entity.events.length > 0
          )
          .flatMap(entity => entity.events);

        setEvents(allEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#a3324e]">
        <p className="text-white text-xl">Loading events...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#a3324e] py-8 pt-45'>
      <h1 className="text-3xl font-bold text-center text-white mb-8">Agenda de eventos</h1>
      
      <div className="container mx-auto px-4">
        {events.length === 0 ? (
          <p className="text-center text-white text-xl">No upcoming events found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <EventCard key={index} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Event Card Component
function EventCard({ event }: { event: Event }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
      {event.image_url && (
        <div className="relative h-145 bg-gray-300">
          <img 
            src={event.image_url} 
            alt={event.image_alt || event.title}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-gray-800">{event.title}</h2>
          <span className="bg-[#a3324e] text-white text-sm py-1 px-2 rounded-md">
            {event.date}
          </span>
        </div>
        
        <p className="text-gray-600 mb-3">{event.location}</p>
        
        {event.description && (
          <p className="text-gray-700 mb-4">{event.description}</p>
        )}
        
        <a 
          href={event.event_link} 
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#a3324e] hover:bg-[#8a2a43] text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Ver detalles
        </a>
      </div>
    </div>
  );
}