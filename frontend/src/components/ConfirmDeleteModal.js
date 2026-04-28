import Button from './Button';
import Modal from './Modal';

export default function ConfirmDeleteModal({ open, onClose, onConfirm, text }) {
  return <Modal open={open} onClose={onClose} title="Confirm Delete"><p className="mb-4 dark:text-gray-200">{text}</p><div className="flex gap-2"><Button className="bg-gray-500" onClick={onClose}>Cancel</Button><Button className="bg-red-600" onClick={onConfirm}>Delete</Button></div></Modal>;
}
