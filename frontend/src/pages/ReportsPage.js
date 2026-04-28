import { useEffect, useState } from 'react';
import { api } from '../api';
import Button from '../components/Button';
import DataTable from '../components/DataTable';

export default function ReportsPage() {
  const [data, setData] = useState({ summary: [], stock_in: [], stock_out: [], low_stock: [] });
  const [start, setStart] = useState(''), [end, setEnd] = useState('');

  const load = async () => {
    const res = await api(`/reports?${start ? `start_date=${start}&` : ''}${end ? `end_date=${end}` : ''}`);
    setData(res);
  };
  useEffect(() => { load(); }, []);

  const exportCsv = async () => {
    const resp = await fetch('http://127.0.0.1:8000/reports/export-csv', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    const blob = await resp.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'stock_report.csv'; a.click();
  };

  return <div className='space-y-4'><h2 className='text-2xl font-bold dark:text-white'>Reports</h2><div className='flex gap-2 flex-wrap'><input type='date' value={start} onChange={(e)=>setStart(e.target.value)} className='p-2 border rounded dark:bg-gray-800 dark:text-white' /><input type='date' value={end} onChange={(e)=>setEnd(e.target.value)} className='p-2 border rounded dark:bg-gray-800 dark:text-white' /><Button onClick={load}>Filter</Button><Button onClick={()=>window.print()} className='bg-indigo-600'>Print</Button><Button onClick={exportCsv} className='bg-green-600'>Export CSV</Button></div>
    <h3 className='font-bold dark:text-white'>Stock Summary</h3><DataTable columns={[{key:'name',label:'Item'},{key:'quantity',label:'Qty'},{key:'min_stock',label:'Min Stock'}]} rows={data.summary} />
    <h3 className='font-bold dark:text-white'>Stock In</h3><DataTable columns={[{key:'item_name',label:'Item'},{key:'quantity_added',label:'Qty'},{key:'date',label:'Date'}]} rows={data.stock_in} />
    <h3 className='font-bold dark:text-white'>Stock Out</h3><DataTable columns={[{key:'item_name',label:'Item'},{key:'quantity_removed',label:'Qty'},{key:'date',label:'Date'}]} rows={data.stock_out} />
    <h3 className='font-bold dark:text-white'>Low Stock</h3><DataTable columns={[{key:'name',label:'Item'},{key:'quantity',label:'Qty'},{key:'min_stock',label:'Min'}]} rows={data.low_stock} />
  </div>;
}
