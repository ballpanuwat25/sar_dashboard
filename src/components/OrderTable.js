import React, { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { fetchOrders, fetchAccounts, updateAccount } from '@/lib/api';
import { toast } from 'react-toastify';

import dynamic from 'next/dynamic';
const FontAwesomeIcon = dynamic(
    () => import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon),
    { ssr: false } 
);

import { faChevronUp, faChevronDown, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

const OrderTable = forwardRef((props, ref) => {
    const [orders, setOrders] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'Id', direction: 'asc' });

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const loadOrders = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);

        console.log('data --> ', data)

        let total = 0
        for(const d of data) {
            total += d.TotalPrice
        }

        console.log('total:' , total)
      } catch (error) {
        console.error('Error loading Orders:', error);
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    useImperativeHandle(ref, () => ({
        reload: loadOrders
    }));

    // เมื่อเปลี่ยน rowsPerPage ให้ reset หน้าเป็น 1
    useEffect(() => {
        setCurrentPage(1);
    }, [rowsPerPage]);

    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
          direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedOrders = useMemo(() => {
        if (!sortConfig.key) return orders;
    
        const sorted = [...orders].sort((a, b) => {
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
    }, [orders, sortConfig]);
    
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
    const totalPages = Math.ceil(sortedOrders.length / rowsPerPage);
    const paginatedOrders = sortedOrders.slice(
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

    function isExpiredOrToday(dateString) {
        // แยก YYYY-MM-DD HH:mm:ss
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);
    
        // สร้าง Date แบบ local
        const targetDate = new Date(year, month - 1, day, hour, minute, second);
    
        const now = new Date();
    
        return now >= targetDate;
    }
    
    const setExpired = async (accountId, SID, UID, OID) => {
        const accountData = await fetchAccounts(accountId);
        let screens = accountData[0].Screens;

        for(const s of screens) {
            let screenId = s.screenId

            if (screenId == SID) {
                s.users = s.users.filter(user => {
                    const shouldKeep = user.userId !== UID || !isExpiredOrToday(user.expDate);
                    // console.log('a:', user.userId);
                    // console.log('b:', user.expDate);
                    // console.log('c:', shouldKeep);
                    // console.log('d:', UID);
                    return shouldKeep;
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
                orderId: OID,
                isExpired: 1,
                screenId: SID
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

        const result = await updateAccount(accountId, { Screens: screens });
        toast.success('อัพเดตสำเร็จ: ',result.message); // "Account updated successfully"

        loadOrders();
        
    }

    function isExpiredOrToday(dateString) {
        const targetDate = new Date(dateString); // วันที่เป้าหมาย
        const now = new Date(); // เวลาปัจจุบัน
    
        return now >= targetDate;
    }

    function checkIsExpired(isExpired) {
        if(isExpired == 1) {
            return true;
        }

        return false;
    }

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
                        {/* <th
                            className="cursor-pointer px-4 py-3 text-left text-md text-gray-50 font-bold select-none"
                            onClick={() => requestSort('Id')}
                        >
                            Id<SortArrow columnKey="Id" />
                        </th> */}
                        <th
                            className="cursor-pointer px-4 py-3 text-left text-md text-gray-50 font-bold select-none"
                            onClick={() => requestSort('User')}
                        >
                            User<SortArrow columnKey="User" />
                        </th>
                        <th
                            className="cursor-pointer px-4 py-3 text-left text-md text-gray-50 font-bold select-none"
                            onClick={() => requestSort('PackageId')}
                        >
                            PackageId<SortArrow columnKey="PackageId" />
                        </th>
                        <th
                            className="cursor-pointer px-4 py-3 text-left text-md text-gray-50 font-bold select-none"
                            onClick={() => requestSort('TotalPrice')}
                        >
                            TotalPrice<SortArrow columnKey="TotalPrice" />
                        </th>
                        <th
                            className="cursor-pointer px-4 py-3 text-left text-md text-gray-50 font-bold select-none"
                            onClick={() => requestSort('CreatedDate')}
                        >
                            CreatedDate<SortArrow columnKey="CreatedDate" />
                        </th>
                        <th
                            className="cursor-pointer px-4 py-3 text-left text-md text-gray-50 font-bold select-none"
                            onClick={() => requestSort('ExpiredDate')}
                        >
                            ExpiredDate<SortArrow columnKey="ExpiredDate" />
                        </th>
                        <th
                            className="cursor-pointer text-center px-4 py-3 text-left text-md text-gray-50 font-bold select-none"
                        >
                            Expired
                        </th>
                        <th className="w-28 px-4 py-3 text-center text-md text-gray-50 font-bold">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-600">
                    {paginatedOrders.length === 0 ? (
                        <tr>
                        <td colSpan={7} className="px-4 py-4 text-center text-gray-400">
                            No data found.
                        </td>
                        </tr>
                    ) : (
                        paginatedOrders.map((item, index) => (
                        <tr key={index}>
                            {/* <td className="px-4 py-3">{item.Id ?? '-'}</td> */}
                            <td className={`px-4 py-3 ${isExpiredOrToday(item.ExpiredDate) ? 'text-red-500' : ''}`}>{item.Username ?? '-'}</td>
                            <td className="px-4 py-3">{item.PackageId ?? '-'}</td>
                            <td className="px-4 py-3">{item.TotalPrice ?? '-'}</td>
                            <td className="px-4 py-3">{formatDateTime(item.CreatedDate)}</td>
                            <td className="px-4 py-3">{formatDateTime(item.ExpiredDate)}</td>
                            <td className="px-4 py-3 text-center">{checkIsExpired(item.isExpired) ? <FontAwesomeIcon icon={faCheck}/> : <FontAwesomeIcon icon={faXmark}/>}</td>
                            <td className="px-4 py-3 text-right flex flex-row gap-2 justify-end">
                                <button
                                    onClick={() => setExpired(item.AccountId, item.ScreenId, item.UserId, item.Id)}
                                    className="rounded-md border px-3 py-1 text-sm shadow-sm cursor-pointer"
                                >
                                    ยืนยันวันหมดอายุ
                                </button>
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
});

OrderTable.displayName = 'OrderTable';
export default OrderTable;