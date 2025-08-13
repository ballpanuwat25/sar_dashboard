import React, { useImperativeHandle, useState, useEffect, forwardRef } from 'react';
import { fetchAccounts } from '../lib/api';
import { toast } from 'react-toastify';
import AccountModal from './AccountModal'

const AccordionTable = forwardRef((props, ref) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [screens, setScreens] = useState('');

  const [accounts, setAccounts] = useState([]);

  const loadAccounts = async () => {
    try {
      const data = await fetchAccounts();  // สมมติ fetchAccounts() ดึงข้อมูลทั้งหมด
      console.log('data: ', data)
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useImperativeHandle(ref, () => ({
    reload: loadAccounts
  }));
  
  useEffect(() => {
    if (editingAccount) {
      setEmail(editingAccount.Email ?? '');
      setPassword(editingAccount.NetflixPassword ?? '');
      setScreens(JSON.stringify(editingAccount.Screens ?? [], null, 2));
    }
  }, [editingAccount]);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  const handleEditClick = async (id) => {
    try {
      const accountData = await fetchAccounts(id);
      setEditingAccount(accountData[0]);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching account:", error);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const saveModal = async () => {
    if (!editingAccount?.Id) {
      toast.warning("ไม่พบข้อมูลบัญชีที่จะแก้ไข");
      return;
    }
  
    let parsedScreens = [];
    try {
      parsedScreens = JSON.parse(screens);
    } catch (err) {
      toast.warning("ข้อมูล Screens ไม่ถูกต้อง (ต้องเป็น JSON format)");
      return;
    }
  
    // สร้าง object updates ที่จะส่งไป PATCH
    const updates = {
      Email: email,
      NetflixPassword: password,
      Screens: JSON.stringify(parsedScreens), // เก็บเป็น JSON string ใน DB
    };
  
    try {
      const res = await fetch('/api/accounts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: editingAccount.Id,
          updates,
        }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        toast.error("บันทึกข้อมูลไม่สำเร็จ: " + (errorData.error || res.statusText));
        return;
      }
  
      toast.success("บันทึกข้อมูลสำเร็จ");

      setIsModalOpen(false);
      setEditingAccount(null);

      await loadAccounts();
  
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message);
    }
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
    <>
      <div className="overflow-x-auto border border-zinc-600 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-zinc-600 bg-zinc-800">
          <thead className="">
            <tr>
              <th className="px-4 py-3 text-left text-md text-gray-50 font-bold">Id</th>
              <th className="px-4 py-3 text-left text-md text-gray-50 font-bold">Account</th>
              <th className="px-4 py-3 text-left text-md text-gray-50 font-bold">Password</th>
              <th className="w-28 px-4 py-3 text-center text-md text-gray-50 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-600">
            {accounts.map((item, index) => (
              <React.Fragment key={index}>
                <tr className="">
                  <td className="px-4 py-3">{item.Id ?? '-'}</td>
                  <td className="px-4 py-3">{item.Email ?? '-'}</td>
                  <td className="px-4 py-3">{item.NetflixPassword ?? '-'}</td>
                  <td className="px-4 py-3 text-right flex flex-row gap-2">
                    <button
                      onClick={() => toggle(index)}
                      className="rounded-md border px-3 py-1 text-sm shadow-sm cursor-pointer"
                    >
                      {openIndex === index ? 'ซ่อน' : 'เปิด'}
                    </button>
                    <button
                        onClick={() => handleEditClick(item.Id)}
                        className="rounded-md border px-3 py-1 text-sm shadow-sm cursor-pointer"
                      >
                        แก้ไข
                    </button>
                  </td>
                </tr>
                {openIndex === index && (
                  <tr>
                    <td colSpan={4} className="px-4 py-3">
                    <div className="text-md">
                      {item.Screens.map((screen, index) => (
                          <div
                          key={index}
                          className={`py-2 ${index !== item.Screens.length - 1 ? 'border-b border-gray-300' : ''}`}
                          >
                          <div className="font-semibold">Screen: {screen.screenId}</div>
                          <div>PIN: {screen.pin}</div>
                          <div>Screen Name: {screen.screenName}</div>

                          <div className="mt-1">
                              {screen.users.map((u, i) => {
                                const nearEnd = isNearEndDate(u.endDate);
                                return(
                                  <div key={i} className="ml-4">
                                      <span className={`font-medium ${nearEnd}`}>@ {u.userName ?? u.userId}</span> - {u.packageName} | start: {u.startDate}, end: {u.expDate}
                                  </div>
                                )})
                              }
                          </div>
                          </div>
                      ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && editingAccount && (
        <AccountModal
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          screens={screens} setScreens={setScreens}
          onSave={saveModal}
          onClose={closeModal}
          action={"แก้ไข"}
        />
      )}
    </>
  );
});

AccordionTable.displayName = 'AccordionTable';
export default AccordionTable;