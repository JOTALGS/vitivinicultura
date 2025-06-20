'use client';

import Map from '@/components/Map';
import Header from '@/components/Header';

export default function Page() {
  return (
    <main style={{ padding: '1rem', height: '100vh' }} className='flex flex-col items-center bg-[#a3324e]'>
      <div style={{ width: '100%', height: '100%' }}>
        <Map />
      </div>
    </main>
  );
}