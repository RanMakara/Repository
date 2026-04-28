import { useEffect, useState } from 'react';
import { getImageUrl } from '../api';

export default function ImagePreviewUpload({ label, value, onFileSelect }) {
  const [preview, setPreview] = useState('');
  useEffect(() => setPreview(value ? (value.startsWith('blob:') ? value : getImageUrl(value)) : ''), [value]);

  return (
    <div className="mb-3">
      <label className="text-sm dark:text-gray-200">{label}</label>
      <input type="file" accept="image/*" className="block mt-1" onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          setPreview(url);
          onFileSelect(file, url);
        }
      }} />
      {preview && <img src={preview} alt="preview" className="mt-2 h-24 w-24 object-cover rounded" />}
    </div>
  );
}
