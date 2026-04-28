import { useEffect, useState } from 'react';
import { api } from '../api';
import DataTable from '../components/DataTable';
import SummaryCard from '../components/SummaryCard';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  useEffect(() => { api('/dashboard').then(setData); }, []);
  if (!data) return <p className='dark:text-white'>Loading dashboard...</p>;
  const s = data.summary;
  return <div className='space-y-4'>
    <h2 className='text-2xl font-bold dark:text-white'>Dashboard</h2>
    <div className='grid md:grid-cols-4 gap-3'>
      <SummaryCard title='Total Users' value={s.total_users} />
      <SummaryCard title='Total Items' value={s.total_items} />
      <SummaryCard title='Total Categories' value={s.total_categories} />
      <SummaryCard title='Total Suppliers' value={s.total_suppliers} />
      <SummaryCard title='Stock In' value={s.total_stock_in} />
      <SummaryCard title='Stock Out' value={s.total_stock_out} />
      <SummaryCard title='Low Stock Items' value={s.low_stock_count} />
    </div>
    <DataTable columns={[{key:'name',label:'Recent Item'},{key:'quantity',label:'Qty'}]} rows={data.recent_items} />
    <DataTable columns={[{key:'item_name',label:'Low Stock Item'},{key:'quantity',label:'Qty'},{key:'min_stock',label:'Min'}]} rows={data.low_stock_items} />
  </div>;
}
