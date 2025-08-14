import Dropdown from "@/components/Dropdown";
import {useState, useEffect} from 'react';
import { useSearch } from '@/context/SearchContext';
import Loader from '@/components/Loader';

export default function Home() {
  const options = [{"Username": "AAA", "Id": 1},{"Username": "NNN", "Id": 2}];
  const [userId, setUserId] = useState('');

  const { searchTerm } = useSearch();

  const data = ["Apple", "Banana", "Orange"];
  const filtered = data.filter(item =>
    item.toLowerCase().includes((searchTerm || "").toLowerCase())
  );


  useEffect(() => {
    console.log('searchTerm:', searchTerm);
  }, [searchTerm]);

  return (
    <div>
      <h2>Dashboard</h2>
      <Dropdown options={options} onSelect={(userId) => setUserId(userId)}/>

      <div>userId: {userId}</div>
      
      <br/>

      <ul>{filtered.map((i, idx) => <li key={idx}>{i}</li>)}</ul>

      <br/>

      <Loader />
    </div>
  );
}
