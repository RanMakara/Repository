import { useEffect, useState } from 'react';
import { api } from '../api';
import Button from './Button';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import DataTable from './DataTable';
import FormInput from './FormInput';
import Modal from './Modal';

export default function CrudPage({ title, endpoint, fields, columns, extraFilters, buildPayload }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [form, setForm] = useState({});
  const [detail, setDetail] = useState(null);
  const [delId, setDelId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api(`/${endpoint}?q=${encodeURIComponent(q)}`);
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [q]);

  const submit = async (e) => {
    e.preventDefault();
    const payload = buildPayload ? buildPayload(form) : form;
    if (mode === 'edit') await api(`/${endpoint}/${form.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    else await api(`/${endpoint}`, { method: 'POST', body: JSON.stringify(payload) });
    setOpen(false); setForm({}); load();
  };

  return <div>
    <div className="flex flex-wrap justify-between gap-2 mb-3">
      <h2 className="text-2xl font-bold dark:text-white">{title}</h2>
      <div className="flex gap-2"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search...' className='p-2 border rounded dark:bg-gray-800 dark:text-white' />{extraFilters}{<Button onClick={() => { setMode('add'); setForm({}); setOpen(true); }}>Add</Button>}</div>
    </div>
    <DataTable columns={columns} rows={rows} loading={loading} actions={(row) => <div className='space-x-2'><button className='text-blue-600' onClick={() => setDetail(row)}>Detail</button><button className='text-green-600' onClick={() => { setMode('edit'); setForm(row); setOpen(true); }}>Edit</button><button className='text-red-600' onClick={() => setDelId(row.id)}>Delete</button></div>} />

    <Modal open={open} onClose={() => setOpen(false)} title={`${mode === 'edit' ? 'Edit' : 'Add'} ${title}`}>
      <form onSubmit={submit}>{fields.map((f) => <FormInput key={f.name} label={f.label} type={f.type || 'text'} value={form[f.name] || ''} onChange={(e) => setForm({ ...form, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value })} required={f.required} />)}<Button type='submit'>Save</Button></form>
    </Modal>

    <Modal open={!!detail} onClose={() => setDetail(null)} title={`${title} Detail`}><pre className='text-sm dark:text-gray-200 overflow-auto'>{JSON.stringify(detail, null, 2)}</pre></Modal>
    <ConfirmDeleteModal open={!!delId} onClose={() => setDelId(null)} onConfirm={async () => { await api(`/${endpoint}/${delId}`, { method: 'DELETE' }); setDelId(null); load(); }} text='Are you sure you want to delete this data?' />
  </div>;
}
