import {useState, useEffect} from 'react';
import { useSearch } from '@/context/SearchContext';

export default function Home() {
  // const { searchTerm } = useSearch();

  // const data = ["Apple", "Banana", "Orange"];
  // const filtered = data.filter(item =>
  //   item.toLowerCase().includes((searchTerm || "").toLowerCase())
  // );

  // useEffect(() => {
  //   console.log('searchTerm:', searchTerm);
  // }, [searchTerm]);

  return (
    <div>
      <h2>Dashboard</h2>
    </div>
  );
}
