// pages/_app.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Loader from '../components/Loader';
import LayoutWrapper from '../components/LayoutWrapper';
import '../styles/globals.css';

import { ToastContainer } from 'react-toastify';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const loadStartTime = useRef(null);

  useEffect(() => {
    const MIN_LOADING_TIME = 2000;

    const handleStart = (url) => {
      if (url !== router.asPath) {
        loadStartTime.current = Date.now();
        setLoading(true);
      }
    };

    const handleComplete = () => {
      if (loadStartTime.current) {
        const elapsed = Date.now() - loadStartTime.current;
        const remainingTime = MIN_LOADING_TIME - elapsed;

        if (remainingTime > 0) {
          // รอให้ครบ 2 วิ ก่อนซ่อน loader
          setTimeout(() => {
            setLoading(false);
            loadStartTime.current = null;
          }, remainingTime);
        } else {
          // โหลดเกิน 2 วิแล้ว ซ่อนเลย
          setLoading(false);
          loadStartTime.current = null;
        }
      } else {
        // กรณีไม่มีเวลาเริ่มโหลด กำหนดซ่อน loader เลย
        setLoading(false);
      }
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  useEffect(() => {
    const loader = document.getElementById('loader-overlay');
    if (loader) {
      const timer = setTimeout(() => {
        loader.style.display = 'none';
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <ToastContainer theme='dark'/>
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(30, 30, 30, 1)', // bg-zinc-900 แบบทึบหน่อย
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <Loader />
        </div>
      )}
      <LayoutWrapper>
        <Component {...pageProps} />
      </LayoutWrapper>
  </>
  );
}
