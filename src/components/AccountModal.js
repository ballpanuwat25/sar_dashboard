import React from 'react';
import JsonInput from './JsonInput';

export default function AccountModal({
  id, setId,
  email, setEmail,
  password, setPassword,
  screens, setScreens,
  onSave,
  onClose,
  action
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-zinc-900 opacity-75"></div>  {/* background overlay */}
      <div className="relative bg-white rounded-lg p-6 w-96 max-w-full">
        <h2 className="text-xl font-bold mb-4 text-zinc-900">{action} Account</h2>

        {action == "เพิ่ม" ? 
          <label className="block mb-2 text-zinc-900 font-semibold">
            ID:
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
        : <></>
        }
        
        <label className="block mb-2 text-zinc-900 font-semibold">
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="block mb-4 text-zinc-900 font-semibold">
          Password:
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        <div className="block mb-4 text-zinc-900 font-semibold">
          <p className="mb-1">Screens:</p>
          <JsonInput value={screens} onChange={setScreens} />
        </div>
        
        <button
          onClick={onSave}
          className="mt-4 rounded-md border border-zinc-900 text-zinc-900 px-4 py-2 w-full font-bold cursor-pointer"
        >
          บันทึก
        </button>

        <button
          onClick={onClose}
          className="mt-2 rounded-md bg-zinc-900 text-white px-4 py-2 w-full font-bold cursor-pointer"
        >
          ปิด
        </button>
      </div>
    </div>
  );
}
