import AdminLayout from '../../components/layouts/AdminLayout';
import ManageCategoriesTags from '../../components/ManageCategoriesTags';

const AdminCategoriesPage = () => (
  <AdminLayout activeTab="manage">
    {({ onMenuClick }) => <ManageCategoriesTags onMenuClick={onMenuClick} />}
  </AdminLayout>
);

export default AdminCategoriesPage;
