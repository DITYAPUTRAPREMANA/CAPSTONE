/**
 * Badge status pinjaman (pill shape)
 */
interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let className =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ";

  switch (status) {
    case "Active":
      className += "bg-green-600 text-white";
      break;
    case "Pending":
      className += "bg-amber-500 text-white";
      break;
    case "Paid":
      className += "bg-blue-700 text-white";
      break;
    default:
      className += "bg-gray-400 text-white";
  }

  return <span className={className}>{status}</span>;
}
