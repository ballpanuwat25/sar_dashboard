// Page.js
import { useState, useEffect } from 'react';
import MultiSelectDropdown from '@/components/MultiSelectDropdown';

export default function Page() {
  const [selected, setSelected] = useState([]);

  const options2 = [
    { id: 1, label: 'Apple' },
    { id: 2, label: 'Banana' },
    { id: 3, label: 'Orange' },
    { id: 4, label: 'Grape' },
    { id: 5, label: 'Mango' },
  ];

  useEffect(() => {
    console.log("selected updated:", selected);
  }, [selected]);

  return (
    <div className="p-4">
      <MultiSelectDropdown
        options={options2}
        selected={selected}
        setSelected={setSelected}
      />
    </div>
  );
}
