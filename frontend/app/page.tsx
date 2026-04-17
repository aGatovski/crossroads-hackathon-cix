'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center font-inherit relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: 'url(/images/beginning_with_logo.jpg)' }}
      ></div>
      <div>
        <div className="absolute top-6 left-8 z-20 text-left">
          <h1 className="text-3xl font-bold tracking-[-0.04em] m-0 leading-none">
            CIX
          </h1>
        </div>
        <div className="fixed left-1/2 transform -translate-x-1/2 bottom-20 z-30">
          <button
            onClick={() => router.push('/setup')}
            className="px-9 py-2.5 text-[1.15rem] border-none bg-white text-black cursor-pointer tracking-[0.06em] font-bold outline-none transition-colors duration-150 hover:bg-neutral-300 rounded-[10px] transition-transform duration-150 hover:scale-105 shadow-lg"
          >
            BEGIN
          </button>
        </div>
      </div>
    </div>
  );
}
