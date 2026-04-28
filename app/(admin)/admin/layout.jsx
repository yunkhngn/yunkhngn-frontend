import AdminLayoutClient from './AdminLayoutClient';

export const metadata = {
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
