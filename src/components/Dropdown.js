import { useState, useEffect, useRef } from 'react';

export default function Dropdown({ options =  [], onSelect, placeholder = "Select an option",
    style={
        'input-bg': 'bg-white', 'options-bg': 'bg-white', 'options-hover': 'bg-gray-100', 'input-text': 'text-gray-400', 
        'options-text': 'text-zinc-900', 'border-color' : 'border-gray-300'
    } 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    setSelected(option);
    onSelect(option.Id);
    setIsOpen(false);
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
        className={`border ${style['border-color']} rounded-md p-2 ${style['input-bg']} cursor-pointer flex justify-between items-center`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`font-normal ${selected ? style['options-text'] : style['input-text']}`}>{selected ? (selected.Username) : placeholder}</span>
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
        <div className={`absolute mt-1 w-full ${style['options-bg']} border rounded-lg shadow-lg z-10`}>
          <ul className="max-h-48 overflow-y-auto">
             {options.map((option) => (
                <li
                  key={option.Id}
                  onClick={() => handleSelect(option)}
                  className={`p-2 hover:${style['options-hover']} rounded ${style['options-text']} cursor-pointer`}
                >
                  {option?.Username}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
