export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-xl p-4">
        <div className="flex justify-between mb-4"><h3 className="font-bold dark:text-white">{title}</h3><button onClick={onClose}>✖</button></div>
        {children}
      </div>
    </div>
  );
}
