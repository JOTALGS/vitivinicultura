'use client';

import Header from '@/components/Header';
import SectionsMap from '@/components/SectionsMap';
import ServiceFilters from '@/components/ServiceFilters';
import Image from 'next/image';
import { useRouter } from 'next/navigation';


export default function HomePage() {
  const router = useRouter();

  const handleClick = (sectionCode: string) => {
    router.push('/enot-explora/' + sectionCode);
  };

  return (
    <main className='flex flex-col bg-[#a3324e] pb-80'>
        <div className='' style={{ width: '100%', height: '100vh', position: 'relative' }}>
          <Image
            src="/images/EXPLORA.jpg"
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
              Explora el enoturismo en Uruguay y descubre bodegas, viñedos y experiencias sensoriales que harán de cada copa un viaje inolvidable.
            </p>
        </div>
          <div className='relative h-screen pt-2 p-10 w-full bg-[#a3324e]'>
            <div className='flex relative justify-center items-center mb-14 text-[50px]'>
              <h2 style={{ fontFamily: 'Aptos' }} className='text-white font-bold'>Enoturismo en Uruguay</h2>
              <div className='absolute top-25 z-1000'>
                <ServiceFilters currentFilters={[]} />
              </div>
            </div>
            {/* Grid container */}
            <div className='grid grid-cols-6 h-full w-full gap-4 p-4 mr-[140px] translate-y-20'>
              
              {/* First 3 columns - 3 rows for images */}
              <div style={{ fontFamily: 'Aptos' }}  className='grid grid-rows-3 col-span-2 gap-15 z-10'>
                {/* First row */}
                <div className='relative flex justify-center items-center translate-y-20 translate-x-30 row-span-1 transition-all duration-200 hover:scale-105 cursor-pointer' onClick={() => handleClick('UYLN')}>
                  <div className='w-[40%]'>
                    <ul className='text-start text-[20px] text-gray-300'>
                      <li>Tannat</li>
                      <li>Cabernet</li>
                      <li>Suavignon</li>
                      <li>Syrah</li>
                      <li>Moscatel de hamburgo</li>
                    </ul>
                  </div>
                  <div className='relative h-full w-[70%]'>
                    <Image
                      src="/images/litnor.png"
                      alt="Logo"
                      fill
                      className="relative object-contain"
                    />
                  </div>
                </div>

                {/* Second row */}
                <div className='relative flex justify-center items-center translate-y-20 translate-x-20 row-span-1 transition-all duration-200 hover:scale-105 cursor-pointer' onClick={() => handleClick('UYLS')}>
                  <div className='w-[30%]'>
                    <ul className='text-start text-[20px] text-gray-300'>
                      <li>Tannat</li>
                      <li>Moscatel de hamburgo</li>
                      <li>Merlot</li>
                      <li>Cabernet</li>
                      <li>Suavignon</li>
                      <li>Syrah</li>
                      <li>Pinot noir</li>
                    </ul>
                  </div>

                  <div className='relative h-full w-[40%]'>
                    <Image
                      src="/images/litsur.png"
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Third row */}
                <div className='relative flex items-center translate-y-15 translate-x-100 row-span-1 transition-all duration-200 hover:scale-105 cursor-pointer' onClick={() => handleClick('UYMT')}>
                  <div className='w-[50%]'>
                    <ul className='text-start text-[20px] text-gray-300'>
                      <li>Tannat</li>
                      <li>Moscatel de hamburgo</li>
                      <li>Ugni blanc</li>
                      <li>Merlot</li>
                      <li>Cabernet Suavignon</li>
                    </ul>
                  </div>
                  
                  <div className='relative h-full w-[100%]'>
                    <Image
                      src="/images/metro.png"
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Middle 2 columns - SectionsMap centered vertically */}
              <div className='col-span-2 flex items-start mt-15 justify-center -z-0'>
                <SectionsMap />
              </div>

              {/* Last 2 columns - 4 rows for images */}
              <div  style={{ fontFamily: 'Aptos' }} className='grid grid-rows-4 col-span-2 gap-4'>
                {/* First row */}
                <div className='relative flex items-center translate-y-40 -translate-x-50 row-span-1 transition-all duration-200 hover:scale-105 cursor-pointer' onClick={() => handleClick('UYNO')}>
                  <div className='relative h-full w-[60%]'>
                    <Image
                      src="/images/nort.png"
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className='w-[40%]'>
                    <ul className='text-start text-[20px] text-gray-300'>
                      <li>Tannat</li>
                      <li>Cabernet Suavignon</li>
                      <li>Merlot</li>
                      <li>Moscatel</li>
                    </ul>
                  </div>
                </div>

                {/* Second row */}
                <div style={{ display: 'none' }} className='relative flex items-center -translate-y-5 -translate-x-30 row-span-1 transition-all duration-200 hover:scale-105 cursor-pointer' onClick={() => handleClick('UYCT')}>
                  <div className='relative h-full w-[50%]'>
                    <Image
                      src="/images/centr.png"
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className=' w-[50%]'>
                    <ul className='text-start text-[20px] text-gray-300'>
                      <li>Cabernet Suavignon</li>
                      <li>Tannat</li>
                      <li>Merlot</li>
                      <li>Marselan</li>
                    </ul>
                  </div>
                </div>

                {/* Third row */}

                {/* Fourth row */}
                <div style={{ display: 'none' }} className='relative flex items-center -translate-y-10 -translate-x-10 row-span-1 transition-all duration-200 hover:scale-105 cursor-pointer' onClick={() => handleClick('UYCE')}>
                  <div className='relative h-full w-[60%]'>
                    <Image
                      src="/images/cenest.png"
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className='w-[40%]'>
                    <ul className='text-start text-[20px] text-gray-300'>
                      <li>Tannat</li>
                      <li>Merlot</li>
                      <li>Cabernet Franc</li>
                    </ul>
                  </div>
                </div>
                <div className='relative flex items-center translate-y-70 -translate-x-20 row-span-1 transition-all duration-200 hover:scale-105 cursor-pointer' onClick={() => handleClick('UYOC')}>
                  <div className='relative h-full w-[100%]'>
                    <Image
                      src="/images/ocean.png"
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className='w-[70%]'>
                    <ul className='text-start text-[20px] text-gray-300'>
                      <li>Tannat</li>
                      <li>Albarino</li>
                      <li>Merlot</li>
                      <li>Cabernet Franc</li>
                    </ul>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
    </main>
  );
}