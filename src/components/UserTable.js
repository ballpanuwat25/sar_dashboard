import React, { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { fetchUsers } from '@/lib/api';
import UserModal from './UserModal';
import { toast } from 'react-toastify';

import dynamic from 'next/dynamic';
const FontAwesomeIcon = dynamic(
    () => import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon),
    { ssr: false } 
);

import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const UserTable = forwardRef((props, ref) => {
    const [users, setUsers] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'Id', direction: 'asc' });

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [username, setUsername] = useState('');
    const [createdDate, setCreatedDate] = useState('');

    const loadUsers = async () => {
      try {
        const data = await fetchUsers();  // สมมติ fetchUsers() ดึงข้อมูลทั้งหมด
        setUsers(data);
      } catch (error) {
        console.error('Error loading Users:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    useImperativeHandle(ref, () => ({
        reload: loadUsers
      }));

    useEffect(() => {
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
        
        if (editingUser) {
            setUsername(editingUser.Username ?? '');
            setCreatedDate(formatDate);
        }
    }, [editingUser]);

    // เมื่อเปลี่ยน rowsPerPage ให้ reset หน้าเป็น 1
    useEffect(() => {
        setCurrentPage(1);
    }, [rowsPerPage]);

    const handleEditClick = async (id) => {
        try {
          const userData = await fetchUsers(id);
          setEditingUser(userData[0]);
          setIsModalOpen(true);
        } catch (error) {
          console.error("Error fetching account:", error);
          toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const saveModal = async () => {
        if (!editingUser?.Id) {
            toast.warning("ไม่พบข้อมูลบัญชีที่จะแก้ไข");
            return;
          }
        
          try {
            const res = await fetch('/api/users', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: editingUser.Id,
                username: username,
                createdDate: createdDate
              }),
            });
        
            if (!res.ok) {
              const errorData = await res.json();
              toast.error("บันทึกข้อมูลไม่สำเร็จ: " + (errorData.error || res.statusText));
              return;
            }
        
            toast.success("บันทึกข้อมูลสำเร็จ");
      
            setIsModalOpen(false);
            setEditingUser(null);
      
            await loadUsers();
        
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message);
        }
    }

    const deleteUser = async (userId) => {
        try {
            const res = await fetch('/api/users', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: userId,
              }),
            });
        
            if (!res.ok) {
              const errorData = await res.json();
              toast.error("บันทึกข้อมูลไม่สำเร็จ: " + (errorData.error || res.statusText));
              return;
            }
        
            toast.success("ลบสำเร็จ");
      
            await loadUsers();
        
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการลบข้อมูล: " + error.message);
        }
    }

    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
          direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedUsers = useMemo(() => {
        if (!sortConfig.key) return users;
    
        const sorted = [...users].sort((a, b) => {
          let aValue = a[sortConfig.key];
          let bValue = b[sortConfig.key];
    
          // กรณี sort วันที่ (CreatedDate)
          if (sortConfig.key === 'CreatedDate') {
            aValue = aValue ? new Date(aValue).getTime() : 0;
            bValue = bValue ? new Date(bValue).getTime() : 0;
          }
    
          // แปลงค่าเป็น string กรณีอื่น ๆ (เช่น Username)
          if (typeof aValue === 'string') aValue = aValue.toLowerCase();
          if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
        return sorted;
    }, [users, sortConfig]);
    
    // ฟังก์ชันแสดง icon บอกทิศทาง sort
    const SortArrow = ({ columnKey }) => {
        if (!sortConfig.key) {
            // ไม่มี key กำหนด ให้แสดงไอคอนขนาดเล็ก default
            return (
              <span className="inline ml-1">
                <FontAwesomeIcon
                  icon={faChevronUp}
                  className="text-gray-600 text-xs"
                />
              </span>
            );
        }

        const isActive = sortConfig.key === columnKey;
      
        return (
          <span className="inline ml-1">
            <FontAwesomeIcon
              icon={isActive
                ? (sortConfig.direction === 'asc' ? faChevronUp : faChevronDown)
                : faChevronUp
              }
              className={isActive ? 'text-gray-300 text-xs' : 'text-gray-600 text-xs'} // สีชัด กับ สีจาง
            />
          </span>
        );
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

    // คำนวณข้อมูลสำหรับหน้าปัจจุบัน
    const totalPages = Math.ceil(sortedUsers.length / rowsPerPage);
    const paginatedUsers = sortedUsers.slice(
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

    return (
        <div>
            {/* Dropdown เลือกจำนวนแถว */}
            <div className="mb-4 flex flex-row justify-between items-center gap-2">
                <div className="flex flex-row gap-2 items-center">
                    <label htmlFor="rowsPerPage" className="text-gray-200">Rows per page:</label>
                    <select
                        id="rowsPerPage"
                        className="rounded bg-zinc-700 text-white px-2 py-2"
                        value={rowsPerPage}
                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    >
                        {[5, 10, 20, 50].map(num => (
                        <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>

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

            <div className="overflow-x-auto border border-zinc-600 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-zinc-600 bg-zinc-800">
                    <thead>
                    <tr>

                        <th
                            className="cursor-pointer px-4 py-3 text-left text-md text-gray-50 font-bold select-none"
                            onClick={() => requestSort('Username')}
                        >
                            Username<SortArrow columnKey="Username" />
                        </th>
                        <th
                            className="cursor-pointer px-4 py-3 text-left text-md text-gray-50 font-bold select-none"
                            onClick={() => requestSort('CreatedDate')}
                        >
                            CreatedDate<SortArrow columnKey="CreatedDate" />
                        </th>
                        <th className="w-28 px-4 py-3 text-center text-md text-gray-50 font-bold">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-600">
                    {paginatedUsers.length === 0 ? (
                        <tr>
                        <td colSpan={3} className="px-4 py-4 text-center text-gray-400">
                            No data found.
                        </td>
                        </tr>
                    ) : (
                        paginatedUsers.map((item, index) => (
                        <tr key={index}>
                            <td className="px-4 py-3">{item.Username ?? '-'}</td>
                            <td className="px-4 py-3">{formatDateTime(item.CreatedDate)}</td>
                            <td className="px-4 py-3 text-right flex flex-row gap-2 justify-end">
                                <button
                                    onClick={() => handleEditClick(item.Id)}
                                    className="rounded-md border px-3 py-1 text-sm shadow-sm cursor-pointer"
                                >
                                    แก้ไข
                                </button>
                                {/* <button
                                    onClick={() => deleteUser(item.Id)}
                                    className="rounded-md border px-3 py-1 text-sm shadow-sm cursor-pointer"
                                >
                                    ลบ
                                </button> */}
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && editingUser && (
                <UserModal
                username={username} setUsername={setUsername}
                createdDate={createdDate} setCreatedDate={setCreatedDate}
                onSave={saveModal}
                onClose={closeModal}
                action={"แก้ไข"}
                />
            )}
        </div>
    )
});

UserTable.displayName = 'UserTable';
export default UserTable;