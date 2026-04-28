export default function DataTable({ columns, rows, loading, emptyText = 'No data', actions }) {
  if (loading) return <p className="dark:text-gray-200">Loading...</p>;
  if (!rows.length) return <p className="dark:text-gray-200">{emptyText}</p>;

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700"><tr>{columns.map((c) => <th key={c.key} className="text-left p-3 dark:text-white">{c.label}</th>)}{actions && <th className="p-3 dark:text-white">Actions</th>}</tr></thead>
        <tbody>
          {rows.map((row) => <tr key={row.id} className="border-t dark:border-gray-700">{columns.map((c) => <td key={c.key} className="p-3 dark:text-gray-100">{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}{actions && <td className="p-3">{actions(row)}</td>}</tr>)}
        </tbody>
      </table>
    </div>
  );
}
