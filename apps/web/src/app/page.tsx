// Root redirects to the marketing homepage (served by the (marketing) route group)
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/home');
}
