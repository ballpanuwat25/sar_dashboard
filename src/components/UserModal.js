import React from 'react';

export default function UserModal({
  id, setId,
  username, setUsername,
  createdDate, setCreatedDate,
  onSave,
  onClose,
  action
}) {

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-zinc-900 opacity-75"></div>  {/* background overlay */}
      <div className="relative bg-white rounded-lg p-6 w-96 max-w-full">
        <h2 className="text-xl font-bold mb-4 text-zinc-900">{action} User</h2>
        
        <label className="block mb-2 text-zinc-900 font-semibold">
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        {action == "แก้ไข" ? 
          <label className="block mb-2 text-zinc-900 font-semibold">
            CreatedDate:
            <input
              disabled
              type="text"
              value={createdDate}
              onChange={(e) => setCreatedDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 text-zinc-500 px-3 py-2"
            />
          </label>
        : <></>
        }
        
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
