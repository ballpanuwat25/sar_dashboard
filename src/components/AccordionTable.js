import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AccountModal from './AccountModal';
import CardScreen from './CardScreen';
import Dropdown from './Dropdown';

import { useSearch } from '@/context/SearchContext';

import { fetchAccounts } from '../lib/api';

const AccordionTable = ({accounts,onReload}) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [screens, setScreens] = useState('');

  const { searchTerm } = useSearch();

  const filtered = accounts.filter(item =>
    item.Email.toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  useEffect(() => {
    console.log('editingAccount:', editingAccount)
    if (editingAccount) {
      setEmail(editingAccount.Email ?? '');
      setPassword(editingAccount.NetflixPassword ?? '');
      setDueDate(editingAccount.PaymentDueDate ?? '');
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
      PaymentDueDate: dueDate,
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

      if (onReload) {
        await onReload();
      }
  
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const numOptions = [
    {"Key": 5, "Value": 5},
    {"Key": 10, "Value": 10},
    {"Key": 20, "Value": 20},
    {"Key": 50, "Value": 50},
  ]

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedAccounts = filtered.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
  );

  // ฟังก์ชันเปลี่ยนหน้า
  const goToPrevPage = () => {
      setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
      setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  function formatDateTime(input) {
    const date = new Date(input);
  
    // เอาปี เดือน วัน
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // เดือนเริ่มจาก 0
    const day = String(date.getUTCDate()).padStart(2, '0');
  
    // เอาชั่วโมง นาที (ตามเวลา  หรือ Local เลือกเอา)
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
    // รวมเป็น string รูปแบบ yyyy-mm-dd HH:mm:00
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  return (
    <div>
        <div className="mb-4 flex flex-row justify-between items-center gap-2">
          <div className="flex flex-row gap-2 items-center">
            <label htmlFor="rowsPerPage" className="text-gray-200">Rows per page:</label>
            <Dropdown options={numOptions} onSelect={(rowsPerPage) => setRowsPerPage(rowsPerPage)} placeholder={'5'}
                style={
                    {
                        'input-bg': 'bg-zinc-700', 'options-bg': 'bg-white', 'options-hover': 'bg-gray-100', 'input-text': 'text-gray-400', 
                        'options-text': 'text-gray-400', 'border-color' : '', 'border' : '', 'input_width': 'w-14'
                    }
                } 
            />
          </div>

          <div className="mb-4 flex flex-row justify-between items-center gap-2">
            <div className="flex justify-between items-center text-gray-300 gap-4">
                <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-600 cursor-pointer disabled:opacity-50"
                >
                    Prev
                </button>

                <span>Page {currentPage} of {totalPages}</span>

                <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-gray-600 cursor-pointer disabled:opacity-50"
                >
                    Next
                </button>
            </div>
          </div>
      </div>
      <div className="overflow-scroll border border-zinc-600 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-zinc-600 bg-zinc-800">
          <thead className="">
            <tr>
              <th className="px-4 py-3 text-left text-md text-gray-50 font-bold">Account</th>
              <th className="px-4 py-3 text-left text-md text-gray-50 font-bold">Password</th>
              <th className="px-4 py-3 text-left text-md text-gray-50 font-bold">Next Payment</th>
              <th className="w-28 px-4 py-3 text-center text-md text-gray-50 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-600">
            {filtered.length === 0 ? 
              (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                      No data found.
                  </td>
                </tr>
              ) :
              (
                paginatedAccounts.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr className="">
                      <td className="px-4 py-3">{item.Email ?? '-'}</td>
                      <td className="px-4 py-3">{item.NetflixPassword ?? '-'}</td>
                      <td className="px-4 py-3">{formatDateTime(item.PaymentDueDate) ?? '-'}</td>
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
                        <div className="text-sm flex flex-row w-full text-center gap-4 justify-between">
                          {item.Screens.map((screen, index) => (
                              <div key={index} className="w-full">
                              <div className="mb-2">Screen Name: {screen.screenName}</div>

                              <CardScreen users={screen.users} accId={item.Id} _screenId={screen.screenId} screens={item.Screens} onUpdateScreens={(newScreens) => {setAccounts(prev => prev.map(a => a.Id === item.Id ? { ...a, Screens: newScreens } : a))}} />
                              <div className="mt-2">PIN: {screen.pin}</div>
                              </div>
                          ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )
            }
          </tbody>
        </table>

      {isModalOpen && editingAccount && (
        <AccountModal
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          screens={screens} setScreens={setScreens}
          dueDate={dueDate} setDueDate={setDueDate}
          onSave={saveModal}
          onClose={closeModal}
          action={"แก้ไข"}
        />
      )}
    </div>
    </div>
  );
};

export default AccordionTable;