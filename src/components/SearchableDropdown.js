import { useState, useEffect, useRef } from 'react';

export default function SearchableDropdown({ options =  [], onSelect, placeholder = "Select an option" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const dropdownRef = useRef(null);

  const filteredOptions = (options || []).filter(opt => {
    const Name = opt?.Username || opt?.Email || "";  // ถ้าไม่มี ให้เป็น ""
    return Name.toLowerCase().includes(search.toLowerCase());
  });
  

  const handleSelect = (option) => {
    setSelected(option);
    onSelect(option.Id);
    setIsOpen(false);
    setSearch('');
  };

  // ตรวจจับการคลิกนอก dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
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
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className="border border-gray-300 rounded-md p-2 bg-white cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-normal text-gray-400">{selected ? (selected.Username || selected?.Email) : placeholder}</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-10">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="p-2 w-full border-b outline-none"
          />

          <ul className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.Id}
                  onClick={() => handleSelect(option)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {option?.Username || option?.Email}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-400">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
