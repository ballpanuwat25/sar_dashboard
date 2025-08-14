import React, { useState, useRef, useEffect } from 'react';
import OrderTable from '@/components/OrderTable';
import OrderModal from '@/components/OrderModal';

import { fetchUsers, fetchPackages, fetchAccounts, updateAccount } from '@/lib/api';

import { toast } from 'react-toastify';

export default function Orders() {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  
    const [userId, setUserId] = useState('');
    const [selected, setSelected] = useState([]); //packages
    const [accountId, setAccountId] = useState('');
    const [screenId, setScreenId] = useState(1);
    const [totalPrice, setTotalPrice] = useState('');

    const tableRef = useRef(null);

    const openModalForCreate = () => {
        setUserId('');
        setAccountId('');
        setSelected([])
        setScreenId(1);
        setTotalPrice('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
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
        if (!userId || !selected || !accountId || !screenId || !totalPrice) {
            toast.warning("กรุณากรอกข้อมูลให้ครบ");
            console.log('userId:', userId);
            console.log('selected:', selected);
            console.log('accountId:', accountId);
            console.log('screenId:', screenId);
            console.log('totalPrice:', totalPrice);
            return;
          }

          console.log('selected:',selected)

          let packageArr = [];
          if(selected.length > 0) {
            for(const s of selected) {
              packageArr.push(s.Id)
            }
          }

          const packageIdStr = packageArr.join(',')

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

          //add data to account
          const accountData = await fetchAccounts(accountId);
          console.log('accountId: ', accountId)
          console.log('accountData: ', accountData)

          const packageData = await fetchPackages(packageArr[0])
          console.log('packageData: ', packageData)

          const days = packageData[0].Day

          const startDate = formatDate.split(' ')[0]
          const startTime = formatDate.split(' ')[1]
          let endDate = addDays(startDate, days)
              endDate = endDate + ' ' + startTime
        
          try {
            const res = await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: userId,
                packageId: packageIdStr,
                accountId: accountId,
                screenId: screenId,
                totalPrice: totalPrice,
                expiredDate: endDate
              }),
            });
        
            const data = await res.json();
        
            if (!res.ok) {
              toast.error(data.error || 'เกิดข้อผิดพลาด');
              return;
            }

            let screens = accountData[0].Screens;
            for(const s of screens) {
              if(s.screenId == screenId) {
                s.users.push({
                  "userId": userId,
                  "packageId": packageArr,
                  "startDate": formatDate,
                  "expDate": endDate,
                  "orderId": data.insertId
                });
              }
            }

            await updateAccount(accountId, { Screens: screens });
        
            toast.success("เพิ่มบัญชีสำเร็จ");
            setIsModalOpen(false);
        
            tableRef.current?.reload();
        
        } catch (error) {
            toast.error("เกิดข้อผิดพลาด: " + error.message);
        }
    };

    const [users, setUsers] = useState([]);
    const loadUsers = async () => {
      try {
          const data = await fetchUsers();
          setUsers(data);
      } catch (error) {
          console.error('Error loading Users:', error);
          toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    }

    const [packages, setPackages] = useState([]);
    const loadPackages = async () => {
      try {
          const data = await fetchPackages();
          setPackages(data);

          console.log('data:', data)
      } catch (error) {
          console.error('Error loading Packages:', error);
          toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    }

    const [accounts, setAccounts] = useState([]);
    const loadAccounts = async () => {
      try {
          const data = await fetchAccounts();
          setAccounts(data);

          console.log('data:', data)
      } catch (error) {
          console.error('Error loading Accounts:', error);
          toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    }

    useEffect(() => {
      loadUsers();
      loadPackages();
      loadAccounts();
    }, []);

    return (
      <main className="p-6 min-h-screen bg-zinc-800 rounded-lg">
        <div className="w-full flex flex-col">
          <div className="flex flex-row justify-between items-center w-full mb-4">
            <h1 className="text-2xl font-semibold">Orders</h1>
            <button
              onClick={openModalForCreate}
              className="rounded-md bg-white text-black px-3 py-2 text-sm shadow-sm cursor-pointer"
            >
              สร้าง
            </button>
          </div>

          <OrderTable ref={tableRef}/>

          <OrderModal
              isOpen={isModalOpen}
              setUserId={setUserId}
              setAccountId={setAccountId}
              screenId={screenId} setScreenId={setScreenId}
              totalPrice={totalPrice} setTotalPrice={setTotalPrice}
              onSave={saveModal}
              onClose={closeModal}
              action={'เพิ่ม'}
              usersOptions={users}
              packagesOptions={packages}
              accountsOptions={accounts}
              selectedValue={selectedValue} setSelectedValue={setSelectedValue}
              selected={selected}
              setSelected={setSelected}
          />
        </div>
      </main>
    );
  }
  