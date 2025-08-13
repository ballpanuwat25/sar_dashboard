'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

import Sidebar from './Sidebar';
import Loader from './Loader'; // สมมติว่าคุณมี Loader component

export default function LayoutWrapper({ children }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <>
      {loading && (
        <div className="bg-zinc-900 fixed inset-0 flex justify-center items-center z-50">
          <Loader />
        </div>
      )}

      <div className="flex h-screen">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

        <div className={`flex-1 transition-all duration-300`}>
          <header className="bg-zinc-900 shadow p-4 flex items-center">
            <button
              className="mr-4 text-white cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle sidebar"
            >
              <FontAwesomeIcon icon={faBars} size="lg" />
            </button>
          </header>
          <main className="p-4 bg-zinc-900 text-white overflow-auto h-[calc(100vh-64px)]">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}