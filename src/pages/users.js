'use client';

import React, { useState, useRef } from 'react';
import UserTable from '../components/UserTable';
import UserModal from '../components/UserModal';

import { toast } from 'react-toastify';

export default function Users() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [id, setId] = useState('');
    const [username, setUsername] = useState('');

    const tableRef = useRef(null);

    const openModalForCreate = () => {
        setId('');
        setUsername('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const saveModal = async () => {
        if (!id || !username) {
            toast.warning("กรุณากรอกข้อมูลให้ครบ");
            return;
          }
        
          try {
            const res = await fetch('/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: id,
                username: username,
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
      <main className="p-6 min-h-screen bg-zinc-800 rounded-lg">
        <div className="w-full flex flex-col">
          <div className="flex flex-row justify-between items-center w-full mb-4">
            <h1 className="text-2xl font-semibold">Users</h1>
            <button
              onClick={openModalForCreate}
              className="rounded-md bg-white text-black px-3 py-2 text-sm shadow-sm cursor-pointer"
            >
              สร้าง
            </button>
          </div>

          <UserTable ref={tableRef}/>

          {isModalOpen && (
            <UserModal
                id={id} setId={setId}
                username={username} setUsername={setUsername}
                onSave={saveModal}
                onClose={closeModal}
                action={'เพิ่ม'}
            />
           )}
        </div>
      </main>
    );
  }
  