import { useEffect, useState } from 'react';
import { api, getImageUrl } from '../api';
import Button from '../components/Button';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import DataTable from '../components/DataTable';
import FormInput from '../components/FormInput';
import ImagePreviewUpload from '../components/ImagePreviewUpload';
import Modal from '../components/Modal';

const initial = { name: '', category_id: '', supplier_id: '', quantity: 0, unit: 'pcs', min_stock: 0, description: '' };

export default function ItemsPage() {
  const [rows, setRows] = useState([]), [categories, setCategories] = useState([]), [suppliers, setSuppliers] = useState([]), [q, setQ] = useState(''), [categoryFilter, setCategoryFilter] = useState('');
  const [open, setOpen] = useState(false), [form, setForm] = useState(initial), [mode, setMode] = useState('add'), [detail, setDetail] = useState(null), [del, setDel] = useState(null), [file, setFile] = useState(null);

  const load = async () => {
    const [items, cats, sups] = await Promise.all([api(`/items?q=${encodeURIComponent(q)}${categoryFilter ? `&category_id=${categoryFilter}` : ''}`), api('/categories'), api('/suppliers')]);
    setRows(items); setCategories(cats); setSuppliers(sups);
  };
  useEffect(() => { load(); }, [q, categoryFilter]);

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form, category_id: Number(form.category_id), supplier_id: Number(form.supplier_id), quantity: Number(form.quantity), min_stock: Number(form.min_stock) };
    let saved;
    if (mode === 'edit') saved = await api(`/items/${form.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    else saved = await api('/items', { method: 'POST', body: JSON.stringify(payload) });
    if (file) { const fd = new FormData(); fd.append('image', file); await api(`/items/${saved.id}/upload`, { method: 'POST', body: fd }); }
    setOpen(false); setForm(initial); setFile(null); load();
  };

  return <div><div className='flex flex-wrap gap-2 justify-between mb-3'><h2 className='text-2xl font-bold dark:text-white'>Items</h2><div className='flex gap-2'><input className='p-2 border rounded dark:bg-gray-800 dark:text-white' placeholder='Search...' value={q} onChange={(e) => setQ(e.target.value)} /><select className='p-2 border rounded dark:bg-gray-800 dark:text-white' value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value=''>All Categories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><Button onClick={() => { setMode('add'); setForm(initial); setOpen(true); }}>Add Item</Button></div></div>
    <DataTable columns={[{key:'name',label:'Item'},{key:'category_name',label:'Category'},{key:'supplier_name',label:'Supplier'},{key:'quantity',label:'Qty',render:(v,row)=> <span>{v} {row.quantity<=row.min_stock && <span className='text-red-600'>Low</span>}</span>},{key:'unit',label:'Unit'},{key:'image',label:'Image',render:(v)=> v ? <img className='h-10 w-10 rounded object-cover' alt='' src={getImageUrl(v)} /> : '-'}]} rows={rows} actions={(row)=><div className='space-x-2'><button className='text-blue-600' onClick={()=>setDetail(row)}>Detail</button><button className='text-green-600' onClick={()=>{setMode('edit'); setForm(row); setOpen(true);}}>Edit</button><button className='text-red-600' onClick={()=>setDel(row.id)}>Delete</button></div>} />
    <Modal open={open} onClose={()=>setOpen(false)} title={`${mode==='edit'?'Edit':'Add'} Item`}><form onSubmit={save}><FormInput label='Name' value={form.name || ''} onChange={(e)=>setForm({...form,name:e.target.value})} required /><label className='block mb-3 dark:text-gray-200'>Category<select className='w-full p-2 border rounded dark:bg-gray-800' value={form.category_id || ''} onChange={(e)=>setForm({...form,category_id:e.target.value})} required><option value=''>Select</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className='block mb-3 dark:text-gray-200'>Supplier<select className='w-full p-2 border rounded dark:bg-gray-800' value={form.supplier_id || ''} onChange={(e)=>setForm({...form,supplier_id:e.target.value})} required><option value=''>Select</option>{suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><FormInput label='Quantity' type='number' min='0' value={form.quantity} onChange={(e)=>setForm({...form,quantity:e.target.value})} required /><FormInput label='Unit' value={form.unit} onChange={(e)=>setForm({...form,unit:e.target.value})} required /><FormInput label='Minimum Stock' type='number' min='0' value={form.min_stock} onChange={(e)=>setForm({...form,min_stock:e.target.value})} required /><FormInput label='Description' value={form.description || ''} onChange={(e)=>setForm({...form,description:e.target.value})} /><ImagePreviewUpload label='Item Image' value={form.image} onFileSelect={(f)=>setFile(f)} /><Button type='submit'>Save</Button></form></Modal>
    <Modal open={!!detail} onClose={()=>setDetail(null)} title='Item Detail'><pre className='text-xs dark:text-gray-200'>{JSON.stringify(detail, null, 2)}</pre></Modal>
    <ConfirmDeleteModal open={!!del} onClose={()=>setDel(null)} onConfirm={async()=>{await api(`/items/${del}`,{method:'DELETE'}); setDel(null); load();}} text='Delete this item?' />
  </div>;
}
