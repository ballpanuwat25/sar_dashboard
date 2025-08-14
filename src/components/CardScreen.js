// components/Card.js
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
const FontAwesomeIcon = dynamic(
    () => import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon),
    { ssr: false } 
);

import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import CardModal from './CardModal'
import { toast } from 'react-toastify';

import { updateAccount } from '@/lib/api';

export default function Card({ users, accId, _screenId, screens, onUpdateScreens }) {
    const [screenId, setScreenId] = useState(_screenId);
    const [createdDate, setCreatedDate] = useState('');
    
    const [orderId, setOrderId] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (startDate, _orderId) => {
        setScreenId(_screenId);
        setCreatedDate(startDate);

        setOrderId(_orderId);

        setIsModalOpen(true);
    };

    const saveModal = async () => {
    
        try {
            // ทำ deep copy ของ screens
            const updatedScreens = screens.map(s => ({
                ...s,
                users: [...s.users]
            }));
    
            // หาผู้ใช้ที่เรากำลังแก้ไข
            let movedUser = null;
            for (let s of updatedScreens) {
                const index = s.users.findIndex(u => u.startDate === createdDate); // ใช้ startDate เป็นตัวระบุชั่วคราว
                if (index !== -1) {
                    movedUser = s.users.splice(index, 1)[0]; // ลบออกจาก screen เก่า
                    break;
                }
            }
    
            if (movedUser) {
                movedUser.startDate = createdDate; // อัพเดต startDate ถ้าต้องการ
                // ใส่เข้า screen ใหม่
                const targetScreen = updatedScreens.find(s => s.screenId === screenId);
                if (targetScreen) {
                    targetScreen.users.push(movedUser);
                } else {
                    // ถ้าไม่มี screen ใหม่ใน array ก็สร้างขึ้นมา
                    updatedScreens.push({
                        screenId: screenId,
                        users: [movedUser]
                    });
                }
            }

            try {
                const res = await fetch('/api/orders', {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    orderId: orderId,
                    screenId: screenId
                  }),
                });
            
                const data = await res.json();
            
                if (!res.ok) {
                  toast.error(data.error || 'เกิดข้อผิดพลาด');
                  return;
                }
    
            } catch (error) {
                toast.error("เกิดข้อผิดพลาด: " + error.message);
            }

            console.log('updatedScreens:', updatedScreens)
    
            // ส่งไป update API
            const result = await updateAccount(accId, { Screens: updatedScreens });
            toast.success('อัพเดตข้อมูลสำเร็จ: ' + result.message);

            onUpdateScreens(updatedScreens);
    
        } catch (err) {
            toast.error('เกิดข้อผิดพลาด: ' + err.message);
        }
    
        setIsModalOpen(false);
    };    

    const closeModal = () => {
        setIsModalOpen(false);
    };

    function isNearEndDate(endDateStr) {
        if (!endDateStr) return false;
      
        // ฟังก์ชันช่วยตัดเวลาออก เหลือแค่วันที่เท่านั้น
        function toDateOnly(dateInput) {
          const d = new Date(dateInput);
          d.setHours(0, 0, 0, 0);
          return d;
        }
      
        const now = toDateOnly(new Date());
        const endDate = toDateOnly(endDateStr);
      
        const diffDays = (endDate - now) / (24 * 60 * 60 * 1000);
      
        if (diffDays < 0) {
          // หมดไปแล้ว
          return "text-red-500";
        } else if (diffDays >= 0 && diffDays <= 1) {
          // ใกล้หมดใน 1 วัน
          return "text-orange-500";
        } else {
          // ยังไม่ใกล้หมด
          return "";
        }
    }

    return (
        <div className="p-2 w-full max-h-60 min-h-60 rounded flex flex-col gap-2 overflow-scroll shadow-lg bg-zinc-700 hover:shadow-xl transition-shadow duration-300">
            {users.map((u, i) => {
                const nearEnd = isNearEndDate(u.expDate);
                return(
                <div key={i} className="p-2 bg-zinc-200 rounded w-full text-left flex flex-col gap-2 justify-between items-left">
                    {/* <span className={`font-medium`}>@ {u.userName ?? u.userId}</span> - {u.packageName} | start: {u.startDate}, end: {u.expDate} */}
                    <div>
                        <p className="text-zinc-900 text-base text-xs"><b>User:</b> <span className={nearEnd}>{u.userName ?? u.userId}</span></p>
                        <p className="text-zinc-900 text-base text-xs"><b>Packages:</b> {u.packageName} </p>
                        <p className="text-zinc-900 text-base text-xs"><b>Start:</b> {u.startDate}</p>
                        <p className="text-zinc-900 text-base text-xs"><b>End:</b> {u.expDate}</p>
                    </div>
                    <button onClick={() => openModal(u.startDate, u.orderId)} className="border border-zinc-400 rounded-full w-full py-1 cursor-pointer text-xs text-zinc-900"><FontAwesomeIcon icon={faPenToSquare}/></button>
                </div>
                )})
            }

            <CardModal
                screenId={screenId}
                setScreenId={setScreenId}
                createdDate={createdDate}
                setCreatedDate={setCreatedDate}
                isOpen={isModalOpen}
                onSave={saveModal}
                onClose={closeModal}
            />
        </div>
    );
}
