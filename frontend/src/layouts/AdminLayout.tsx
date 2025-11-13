import { AdminSidebar } from '../components/admin/AdminSidebar';
import { Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}

