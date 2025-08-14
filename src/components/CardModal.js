export default function CardModal({
    screenId, setScreenId,
    createdDate, setCreatedDate,
    onSave,
    onClose,
    isOpen,
}) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-zinc-900 opacity-75"></div>  {/* background overlay */}
      <div className="relative bg-white rounded-lg p-6 w-96 max-w-full">
        <h2 className="text-xl font-bold mb-4 text-zinc-900">แก้ไข Screen</h2>
        
        {/* <label className="block mb-2 text-zinc-900 font-semibold">
          User:
          <SearchableDropdown
            options={usersOptions}
            onSelect={(userId) => setUserId(userId)}
            placeholder="Select User"
          />
        </label> */}

        {/* <label className="block text-zinc-900 font-semibold">
          Packages:
        </label>
        <MultiSelectDropdown options={packagesOptions} selected={selected} setSelected={setSelected} onTotalPriceChange={0}  /> */}

        <label className="block text-left mb-2 text-zinc-900 font-semibold">
          Screen:
          <select
              id="screenId"
              className="mt-1 rounded border border-gray-300 px-2 py-2 w-full"
              value={screenId}
              onChange={(e) => setScreenId(Number(e.target.value))}
          >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
          </select>
        </label>

        <label className="block text-left mb-2 text-zinc-900 font-semibold">
            StartDate:
            <input
                type="text"
                value={createdDate}
                onChange={(e) => setCreatedDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
             />
        </label>
        
        <button
          onClick={onSave}
          className="mt-2 rounded-md border border-zinc-900 text-zinc-900 px-4 py-2 w-full font-bold cursor-pointer"
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
