'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import AccordionTable from '@/components/AccordionTable';
import AccountModal from '@/components/AccountModal.js';
import Dropdown from '@/components/Dropdown.js';

import { fetchAccounts } from '../lib/api';

export default function Page() {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [screens, setScreens] = useState('');
  const [dueDate, setDueDate] = useState('');

  const openModalForCreate = () => {
    const nowDate = new Date();
    const localTime = new Date(nowDate.getTime() + 7 * 60 * 60 * 1000);
    const formatDate =
      localTime.getUTCFullYear() +
      '-' +
      String(localTime.getUTCMonth() + 1).padStart(2, '0') +
      '-' +
      String(localTime.getUTCDate()).padStart(2, '0') +
      ' ' +
      String(localTime.getUTCHours()).padStart(2, '0') +
      ':' +
      String(localTime.getUTCMinutes()).padStart(2, '0') +
      ':' +
      String(localTime.getUTCSeconds()).padStart(2, '0');

      console.log('formatDate:', formatDate)

    setId('');
    setEmail('');
    setPassword('');
    setDueDate(formatDate);
    
    let initScreens = [
      {
        "screenId": 1,
        "screenName": "A1",
        "pin": "1111",
        "users": [],
      },
      {
        "screenId": 2,
        "screenName": "A2",
        "pin": "2222",
        "users": [],
      },
      {
        "screenId": 3,
        "screenName": "A3",
        "pin": "3333",
        "users": [],
      },
      {
        "screenId": 4,
        "screenName": "A4",
        "pin": "4444",
        "users": [],
      },
      { "screenId": 5,
        "screenName": "A5",
        "pin": "5555",
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
    if (!email || !password || !dueDate || !screens) {
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
          PaymentDueDate: dueDate,
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
  
      loadAccounts();
  
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  const loadAccounts = async () => {
    try {
      const data = await fetchAccounts();
      const accountsWithState = data.map(acc => ({
        ...acc,
        Screens: acc.Screens ?? [] // ทำให้ Screens เป็น array
      }));

      // console.log('accountsWithState:', accountsWithState);
      setAccounts(accountsWithState);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const [filter, setFilter] = useState('')
  const options = [
    {
      "Key": 0,
      "Value": "ทั้งหมด"
    },
    {
      "Key": 1,
      "Value": "จอว่าง"
    },
    // {
    //   "Key": 2,
    //   "Value": "จอ 1 คน"
    // },
  ]

  const accountsFiltered = accounts.filter(account => {
    switch (filter) {
      case 1: // ต้องมีจอที่ว่าง (users.length === 0)
        return account.Screens.some(screen => screen.users.length === 0);
  
      case 2: // ต้องมีจอที่ไม่ว่าง (users.length > 0)
        return account.Screens.some(screen => screen.users.length > 0);
  
      default: // ทั้งหมด
        return true;
    }
  });  

  return (
    <main className="p-6 min-h-screen bg-zinc-800 rounded-lg">
        <div className="flex flex-row justify-between items-center w-full mb-4">
          <h1 className="text-2xl font-semibold">Accounts</h1>
          <div className="flex flex-row gap-2 w-50">
              <Dropdown options={options} placeholder={'ทั้งหมด'} onSelect={(filter) => setFilter(filter)}
                  style={
                    {
                        'input-bg': 'bg-zinc-700', 'options-bg': 'bg-white', 'options-hover': 'bg-gray-100', 'input-text': 'text-gray-400', 
                        'options-text': 'text-gray-400', 'border-color' : '', 'border' : '', 'input_width': 'w-full'
                    }
                  } 
              />
              <button
                onClick={openModalForCreate}
                className="rounded-md bg-white text-black px-3 py-2 text-sm shadow-sm cursor-pointer"
              >
                สร้าง
              </button>
            </div>
        </div>
        <AccordionTable accounts={accountsFiltered} onReload={loadAccounts} />

      {isModalOpen && (
        <AccountModal
          id={id} setId={setId}
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          screens={screens} setScreens={setScreens}
          dueDate={dueDate} setDueDate={setDueDate}
          onSave={saveModal}
          onClose={closeModal}
          action={'เพิ่ม'}
        />
      )}
    </main>
  );
}
