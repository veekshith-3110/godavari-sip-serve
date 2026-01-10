import { Routes, Route } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardWidgets from '@/components/admin/DashboardWidgets';
import SalesReports from '@/components/admin/SalesReports';
import MenuManager from '@/components/admin/MenuManager';
import ExpenseLog from '@/components/admin/ExpenseLog';
import PrinterSettings from '@/components/admin/PrinterSettings';

const Admin = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto pt-20 lg:pt-6">
        <Routes>
          <Route index element={<DashboardWidgets />} />
          <Route path="sales" element={<SalesReports />} />
          <Route path="menu" element={<MenuManager />} />
          <Route path="expenses" element={<ExpenseLog />} />
          <Route path="printer" element={<PrinterSettings />} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;
