export default function SummaryCard({ title, value }) {
  return <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow"><p className="text-sm text-gray-500">{title}</p><p className="text-2xl font-bold dark:text-white">{value}</p></div>;
}
