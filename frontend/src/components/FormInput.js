export default function FormInput({ label, ...props }) {
  return (
    <label className="block mb-3">
      <span className="text-sm dark:text-gray-200">{label}</span>
      <input className="w-full p-2 mt-1 border rounded-lg dark:bg-gray-800 dark:text-white" {...props} />
    </label>
  );
}
