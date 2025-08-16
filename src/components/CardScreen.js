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

    function addDays(dateStr, daysToAdd) {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + daysToAdd);
        const yyyy = date.getFullYear();
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd = date.getDate().toString().padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    const saveModal = async () => {
    
        try {
            // ทำ deep copy ของ screens
            const updatedScreens = screens.map(s => ({
                ...s,
                users: [...s.users]
            }));

            let newExpired = '';
    
            // หาผู้ใช้ที่เรากำลังแก้ไข
            let movedUser = null;
            for (let s of updatedScreens) {
                const index = s.users.findIndex(u => u.orderId === orderId); // ใช้ orderId แทนเพื่อความชัดเจน
                if (index !== -1) {
                    // ไม่ว่าเราจะย้ายหรือไม่ ก็จะเจอ user ตรงนี้
                    movedUser = s.users[index];

                    const startDate = createdDate.split(' ')[0]
                    const startTime = createdDate.split(' ')[1]
                    let endDate = addDays(startDate, s.users[index].days)
                        endDate = endDate + ' ' + startTime

                        newExpired = endDate

                    // ถ้าจอยังเหมือนเดิม → แก้ createdDate ตรงนี้ได้เลย
                    if (s.screenId === screenId) {
                        movedUser.startDate = createdDate;
                        movedUser.expDate = newExpired;
                    } else {
                        // ถ้าจอเปลี่ยน → ลบออกจากจอเก่าแล้วไปใส่จอใหม่
                        movedUser = s.users.splice(index, 1)[0];
                        movedUser.startDate = createdDate;
                        movedUser.expDate = newExpired;
                        const targetScreen = updatedScreens.find(scr => scr.screenId === screenId);
                        if (targetScreen) {
                            targetScreen.users.push(movedUser);
                        } else {
                            updatedScreens.push({
                                screenId: screenId,
                                users: [movedUser]
                            });
                        }
                    }
                    break;
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
                    screenId: screenId,
                    createdDate: createdDate,
                    expiredDate: newExpired
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

        const now = new Date();
        const endDate = new Date(endDateStr);

        const diffMs = endDate - now;
        const diffDays = diffMs / (24 * 60 * 60 * 1000);

        if (diffDays < 0) {
            return "text-red-600"; // หมดไปแล้ว
        } else if (diffDays <= 1) {
            return "text-orange-400"; // ใกล้หมด
        } else {
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
                        <p className="text-zinc-900 text-base text-xs"><b>User: <span className={nearEnd}>{u.userName ?? u.userId}</span></b> </p>
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
