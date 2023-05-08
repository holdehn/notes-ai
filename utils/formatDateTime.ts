import { format } from 'date-fns';

export default function formatDateTime(dateString: string | number | Date) {
  const date = new Date(dateString);
  return format(date, 'PPP p');
}
