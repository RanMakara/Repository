import { useEffect, useState } from 'react';
import { api } from '../api';
import Button from '../components/Button';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import DataTable from '../components/DataTable';
import FormInput from '../components/FormInput';
import Modal from '../components/Modal';

function StockTemplate({ title, endpoint, qtyField, extraField }) {
  const [rows, setRows] = useState([]), [items, setItems] = useState([]), [q, setQ] = useState(''), [itemId, setItemId] = useState(''), [start, setStart] = useState(''), [end, setEnd] = useState('');
  const [open, setOpen] = useState(false), [mode, setMode] = useState('add'), [detail, setDetail] = useState(null), [del, setDel] = useState(null);
  const [form, setForm] = useState({ item_id: '', [qtyField]: 1, date: new Date().toISOString().slice(0,16), note: '', purpose: '' });

  const load = async () => {
    const query = `?q=${encodeURIComponent(q)}${itemId ? `&item_id=${itemId}`:''}${start ? `&start_date=${start}`:''}${end?`&end_date=${end}`:''}`;
    const [data, itemData] = await Promise.all([api(`/${endpoint}${query}`), api('/items')]);
    setRows(data); setItems(itemData);
  };
  useEffect(() => { load(); }, [q, itemId, start, end]);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, item_id: Number(form.item_id), [qtyField]: Number(form[qtyField]), date: new Date(form.date).toISOString() };
    if (mode === 'edit') await api(`/${endpoint}/${form.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    else await api(`/${endpoint}`, { method: 'POST', body: JSON.stringify(payload) });
    setOpen(false); load();
  };

  return <div><div className='flex flex-wrap gap-2 justify-between mb-3'><h2 className='text-2xl font-bold dark:text-white'>{title}</h2><div className='flex flex-wrap gap-2'><input className='p-2 border rounded dark:bg-gray-800 dark:text-white' value={q} onChange={(e)=>setQ(e.target.value)} placeholder='Search item' /><select className='p-2 border rounded dark:bg-gray-800 dark:text-white' value={itemId} onChange={(e)=>setItemId(e.target.value)}><option value=''>All Items</option>{items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select><input type='date' className='p-2 border rounded dark:bg-gray-800 dark:text-white' value={start} onChange={(e)=>setStart(e.target.value)} /><input type='date' className='p-2 border rounded dark:bg-gray-800 dark:text-white' value={end} onChange={(e)=>setEnd(e.target.value)} /><Button onClick={()=>{setMode('add'); setForm({ item_id:'', [qtyField]:1, date:new Date().toISOString().slice(0,16), note:'', purpose:'' }); setOpen(true);}}>Add</Button></div></div>
    <DataTable columns={[{key:'item_name',label:'Item'},{key:qtyField,label:'Quantity'},{key:'date',label:'Date',render:(v)=>new Date(v).toLocaleString()},{key:'note',label:'Note'},{key:'purpose',label:'Purpose'}]} rows={rows} actions={(row)=><div className='space-x-2'><button className='text-blue-600' onClick={()=>setDetail(row)}>Detail</button><button className='text-green-600' onClick={()=>{setMode('edit'); setForm({...row,date:new Date(row.date).toISOString().slice(0,16)}); setOpen(true);}}>Edit</button><button className='text-red-600' onClick={()=>setDel(row.id)}>Delete</button></div>} />
    <Modal open={open} onClose={()=>setOpen(false)} title={title}><form onSubmit={submit}><label className='block mb-3 dark:text-gray-200'>Item<select required className='w-full p-2 border rounded dark:bg-gray-800' value={form.item_id || ''} onChange={(e)=>setForm({...form,item_id:e.target.value})}><option value=''>Select</option>{items.map(i=><option key={i.id} value={i.id}>{i.name} ({i.quantity})</option>)}</select></label><FormInput type='number' min='1' label='Quantity' value={form[qtyField]} onChange={(e)=>setForm({...form,[qtyField]:e.target.value})} required />{extraField && <FormInput label={extraField.label} value={form[extraField.name] || ''} onChange={(e)=>setForm({...form,[extraField.name]:e.target.value})} />}<FormInput type='datetime-local' label='Date' value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})} required /><FormInput label='Note' value={form.note || ''} onChange={(e)=>setForm({...form,note:e.target.value})} /><Button type='submit'>Save</Button></form></Modal>
    <Modal open={!!detail} onClose={()=>setDetail(null)} title='Detail'><pre className='text-xs dark:text-gray-200'>{JSON.stringify(detail,null,2)}</pre></Modal>
    <ConfirmDeleteModal open={!!del} onClose={()=>setDel(null)} onConfirm={async()=>{await api(`/${endpoint}/${del}`,{method:'DELETE'}); setDel(null); load();}} text='Delete this data?' />
  </div>;
}

export const StockInPage = () => <StockTemplate title='Stock In' endpoint='stock-in' qtyField='quantity_added' />;
export const StockOutPage = () => <StockTemplate title='Stock Out' endpoint='stock-out' qtyField='quantity_removed' extraField={{ name: 'purpose', label: 'Purpose / Used By' }} />;
