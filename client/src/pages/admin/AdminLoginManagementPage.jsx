import AdminLayout from '../../components/layouts/AdminLayout';
import LoginManagement from '../../components/LoginManagement';

const AdminLoginManagementPage = () => (
  <AdminLayout activeTab="login-management">
    {({ onMenuClick }) => <LoginManagement onMenuClick={onMenuClick} />}
  </AdminLayout>
);

export default AdminLoginManagementPage;
