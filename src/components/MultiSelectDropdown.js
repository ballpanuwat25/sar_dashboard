import { useState, useEffect, useRef } from 'react';

export default function MultiSelectDropdown({ options = [], selected = [], setSelected, onTotalPriceChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const filteredOptions = options.filter(
    (opt) =>
      !selected.find((sel) => sel.Id === opt.Id) &&
      opt.Name.toLowerCase().includes(search.toLowerCase())
  );

  const addSelected = (item) => {
    if (!selected.find((sel) => sel.Id === item.Id)) {
      const newSelected = [...selected, item];
      setSelected(newSelected);
      
      // คำนวณ total_price
      const totalPrice = newSelected.reduce((sum, el) => sum + (el.Price || 0), 0);

      // ส่งกลับไป parent
      if (onTotalPriceChange) onTotalPriceChange(totalPrice);
    }
    setSearch('');
  };

  const removeSelected = (id) => {
    const newSelected = selected.filter((item) => item.Id !== id);
    setSelected(newSelected);

    // คำนวณ total_price ใหม่
    const totalPrice = newSelected.reduce((sum, el) => sum + (el.Price || 0), 0);
    if (onTotalPriceChange) onTotalPriceChange(totalPrice);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch(''); // เคลียร์ search เวลาปิด dropdown
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="w-full relative mb-2" ref={containerRef}>
      {/* แสดง badge และ input เพื่อเปิด dropdown (input นี้ไม่ใช่ช่อง search) */}
      <div
        className="min-h-[40px] border border-gray-300 text-zinc-900 rounded flex flex-wrap items-center gap-1 p-1 cursor-text"
        onClick={() => setIsOpen(true)}
      >
        {selected.length === 0 && (
            <span className="ml-1 text-gray-400 select-none">Select items...</span>
        )}

        {selected.map((item) => (
          <div
            key={item.Id}
            className="bg-zinc-900 text-white rounded-full px-3 py-1 flex items-center space-x-1"
          >
            <span>{item.Name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeSelected(item.Id);
              }}
              className="hover:text-gray-300 cursor-pointer"
              type="button"
              aria-label={`Remove ${item.Name}`}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full max-h-64 rounded border border-gray-300 bg-white shadow-lg flex flex-col">
          {/* ช่อง search แยกด้านบน dropdown */}
          <input
            type="text"
            className="border-b text-zinc-900 border-gray-300 p-2 outline-none"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          {/* List options */}
          {filteredOptions.length > 0 ? (
            <ul className="overflow-auto flex-grow">
              {filteredOptions.map((opt, index) => (
                <li
                key={`${opt.Id}-${index}`}
                  className="cursor-pointer text-zinc-900 px-3 py-2 hover:bg-blue-100"
                  onClick={() => addSelected(opt)}
                >
                  {opt.Name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-gray-500">No options found</div>
          )}
        </div>
      )}
    </div>
  );
}
