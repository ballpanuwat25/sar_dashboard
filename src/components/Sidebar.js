'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
const FontAwesomeIcon = dynamic(
  () => import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon),
  { ssr: false }
);

import { faTimes, faUsers, faListCheck, faChartPie, faReceipt } from '@fortawesome/free-solid-svg-icons';

import Image from 'next/image';

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      <div
        className={`
          fixed md:static z-20 top-0 left-0 h-full
          bg-zinc-900 text-white transition-all duration-300 border-r border-zinc-600
          ${isOpen ? 'w-64' : 'w-16'}
          ${!isOpen && 'md:translate-x-0 -translate-x-full md:relative'}
        `}
      >
        <div className="flex items-center justify-between p-4">
          <Image src="/favicon.ico" alt="Favicon" width={32} height={32} />
          <button
            className={`cursor-pointer ${!isOpen ? 'hidden' : 'md:hidden'}`}
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        <nav className={`p-4 space-y-2 ${!isOpen ? 'text-center' : ''}`}>
          <Link href="/" className={`flex flex-row gap-3 items-center hover:bg-gray-700 p-2 rounded ${
                !isOpen ? 'flex justify-center' : ''
              }`}>
              <FontAwesomeIcon icon={faChartPie} size="md" />
              {isOpen ? 'Dashboard' : ''}
          </Link>
          <Link href="/accounts" className={`flex flex-row gap-3 items-center hover:bg-gray-700 p-2 rounded ${
                !isOpen ? 'flex justify-center' : ''
              }`}>
              <FontAwesomeIcon icon={faListCheck} size="md" />
              {isOpen ? 'Accounts' : ''}
          </Link>
          <Link href="/users" className={`flex flex-row gap-3 items-center hover:bg-gray-700 p-2 rounded ${
                !isOpen ? 'flex justify-center' : ''
              }`}>
              <FontAwesomeIcon icon={faUsers} size="md" />
              {isOpen ? 'Users' : ''}
          </Link>
          <Link href="/orders" className={`flex flex-row gap-3 items-center hover:bg-gray-700 p-2 rounded ${
                !isOpen ? 'flex justify-center' : ''
              }`}>
              <FontAwesomeIcon icon={faReceipt} size="md" />
              {isOpen ? 'Orders' : ''}
          </Link>
        </nav>
      </div>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
