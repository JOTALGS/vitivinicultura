import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SERVICE_FILTERS = [
  { code: 'UYFAL', label: 'Alojamiento' },
  { code: 'UYFEV', label: 'Eventos' },
  { code: 'UYFTI', label: 'Tienda' },
  { code: 'UYFRE', label: 'Restaurante' },
  { code: 'UYFTY', label: 'Bodega/Viñedo' },
];

const ServiceFilters: React.FC<{ currentFilters: string[] }> = ({ currentFilters }) => {
  const router = useRouter();
  const [selectedFilters, setSelectedFilters] = useState<string[]>(currentFilters);
  
  // Keep local state in sync with props when currentFilters change
  useEffect(() => {
    setSelectedFilters(currentFilters);
  }, [currentFilters]);

  const handleCheckboxChange = (filterCode: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterCode)
        ? prev.filter(f => f !== filterCode)
        : [...prev, filterCode]
    );
  };

  const applyFilters = () => {
    const newPath = selectedFilters.length > 0 
      ? `/enot-explora/${selectedFilters.join('-')}` 
      : '/enot-explora';
    
    router.push(newPath);
  };

  return (
    <div style={{ fontFamily: 'Aptos' }}  className="rounded-lg p-4 mb-4 z-1000">
        <h3 className="text-[25px] text-gray-300 font-semibold mb-3">Filtrar por servicios:</h3>
      
      <div className="flex flex-row gap-2 mb-2">
        {SERVICE_FILTERS.map(({ code, label }) => (
          <label 
            key={code} 
            className="flex items-center cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selectedFilters.includes(code)}
              onChange={() => handleCheckboxChange(code)}
              className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-300 text-[18px] group-hover:text-[#722F37]">
              {label}
            </span>
          </label>
        ))}
      </div>
      <div className="flex items-center justify-center text-center gap-3">
        <button
          onClick={applyFilters}
          className="px-4 py-2 text-[15px] bg-[#722F37] text-gray-300 rounded-md hover:bg-[#722F37]/40 transition-colors"
        >
          Aplicar Filtros
        </button>
        
        <button
          onClick={() => {
            setSelectedFilters([]);
            router.push('/enot-explora');
          }}
          className="px-4 py-2 text-[15px] bg-[#F2E6CE] text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Limpiar
        </button>
      </div>
      
    </div>
  );
};

export default ServiceFilters;