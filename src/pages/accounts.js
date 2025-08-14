'use client';

import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';

import AccordionTable from '@/components/AccordionTable';
import AccountModal from '@/components/AccountModal.js';

import Loader from '@/components/Loader';

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [screens, setScreens] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  const tableRef = useRef(null);

  const openModalForCreate = () => {
    setId('');
    setEmail('');
    setPassword('');
    
    let initScreens = [
      {
        "screenId": 1,
        "screenName": "",
        "pin": "",
        "users": [],
      },
      {
        "screenId": 2,
        "screenName": "",
        "pin": "",
        "users": [],
      },
      {
        "screenId": 3,
        "screenName": "",
        "pin": "",
        "users": [],
      },
      {
        "screenId": 4,
        "screenName": "",
        "pin": "",
        "users": [],
      },
      { "screenId": 5,
        "screenName": "",
        "pin": "",
        "users": [],
      }
    ]
    
    setScreens(JSON.stringify(initScreens, null, 2));

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const saveModal = async () => {
    if (!id || !email || !password || !screens) {
      toast.warning("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
  
    let parsedScreens = [];
    try {
      parsedScreens = JSON.parse(screens);
    } catch (err) {
      toast.warning("ข้อมูล Screens ไม่ถูกต้อง (ต้องเป็น JSON format)");
      return;
    }
  
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Id: id,
          Email: email,
          NetflixPassword: password,
          Screens: JSON.stringify(parsedScreens), // เก็บเป็น JSON string ใน DB
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.error(data.error || 'เกิดข้อผิดพลาด');
        return;
      }
  
      toast.success("เพิ่มบัญชีสำเร็จ");
  
      // ปิด modal
      setIsModalOpen(false);
  
      tableRef.current?.reload();
  
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    }
  };  

  return (
    <main className="p-6 max-h-full h-full bg-zinc-800 rounded-lg">
      <div className="w-full h-full flex flex-col justify-center items-center">

        {
          // isLoading ?
          //   <Loader />
          // :
          <div className="w-full h-full">
            <div className="flex flex-row justify-between items-center w-full mb-4">
              <h1 className="text-2xl font-semibold">Accounts</h1>
              <button
                onClick={openModalForCreate}
                className="rounded-md bg-white text-black px-3 py-2 text-sm shadow-sm cursor-pointer"
              >
                สร้าง
              </button>
            </div>
            <AccordionTable setIsLoading={setIsLoading} ref={tableRef} />
          </div>
        }
      </div>

      {isModalOpen && (
        <AccountModal
          id={id} setId={setId}
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          screens={screens} setScreens={setScreens}
          onSave={saveModal}
          onClose={closeModal}
          action={'เพิ่ม'}
        />
      )}
    </main>
  );
}
