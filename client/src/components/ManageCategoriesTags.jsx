import { useState, useEffect } from 'react';
import { Button, Tree, Modal, Form, Input, Select, notification, Spin, Space } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FolderOutlined, 
  TagOutlined, 
  MenuOutlined,
  ExpandOutlined,
  ShrinkOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import apiClient from '../axios/apiClient';
import { API_ENDPOINTS } from '../constants/api';
const ManageCategoriesTags = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [allKeys, setAllKeys] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.TREE);
      const categoriesData = response.data;
      setCategories(categoriesData);
      const formattedTree = categoriesData.map(cat => {
        const isOtherCategory = cat.slug === 'other';
        return {
          title: (
            <div className="flex items-center justify-between group">
              <span className="flex items-center gap-2">
                <FolderOutlined className="text-blue-600" />
                <strong>{cat.name}</strong>
                <span className="text-gray-400 text-xs">({cat.count} prompts)</span>
                {isOtherCategory && (
                  <span className="text-xs text-gray-500 italic">(System)</span>
                )}
              </span>
              {!isOtherCategory && (
                <Space size="small" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddTag(cat);
                    }}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCategory(cat);
                    }}
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat);
                    }}
                  />
                </Space>
              )}
            </div>
          ),
          key: `cat-${cat.id}`,
          children: cat.tags?.map(tag => ({
            title: (
              <div className="flex items-center justify-between group">
                <span className="flex items-center gap-2">
                  <TagOutlined className="text-green-600" />
                  {tag.name}
                  <span className="text-gray-400 text-xs">({tag.count} prompts)</span>
                </span>
                <Space size="small" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTag(tag, cat);
                    }}
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTag(tag);
                    }}
                  />
                </Space>
              </div>
            ),
            key: `tag-${tag.id}`,
            isLeaf: true
          }))
        };
      });
      const categoryKeys = categoriesData.map(cat => `cat-${cat.id}`);
      setAllKeys(categoryKeys);
      setExpandedKeys(categoryKeys);
      setTreeData(formattedTree);
    } catch (error) {
      console.error('Error fetching data:', error);
      notification.error({
        message: t('common.error'),
        description: t('manageCategoriesTags.errorLoading', 'Error loading categories and tags'),
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAddCategory = () => {
    setModalType('add-category');
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };
  const handleEditCategory = (category) => {
    setModalType('edit-category');
    setEditingItem(category);
    form.setFieldsValue({
      name: category.name,
      slug: category.slug
    });
    setModalOpen(true);
  };
  const handleAddTag = (category) => {
    setModalType('add-tag');
    setEditingItem({ category });
    form.setFieldsValue({
      category_id: category.id
    });
    setModalOpen(true);
  };
  const handleEditTag = (tag, category) => {
    setModalType('edit-tag');
    setEditingItem({ tag, category });
    form.setFieldsValue({
      name: tag.name,
      category_id: category.id
    });
    setModalOpen(true);
  };
  const handleDeleteCategory = (category) => {
    Modal.confirm({
      title: t('manageCategoriesTags.deleteCategory', 'Delete Category'),
      content: t('manageCategoriesTags.deleteCategoryConfirm', `Are you sure you want to delete category "${category.name}"? All tags in this category will also be deleted.`),
      okText: t('common.delete', 'Delete'),
      okType: 'danger',
      cancelText: t('common.cancel', 'Cancel'),
      onOk: async () => {
        try {
          await apiClient.delete(`${API_ENDPOINTS.CATEGORIES.BASE}/${category.id}`);
          notification.success({
            message: t('common.success'),
            description: t('manageCategoriesTags.categoryDeleted', 'Category deleted successfully'),
            placement: 'topRight'
          });
          fetchData();
        } catch (error) {
          notification.error({
            message: t('common.error'),
            description: error.response?.data?.detail || t('manageCategoriesTags.errorDeletingCategory', 'Error deleting category'),
            placement: 'topRight'
          });
        }
      }
    });
  };
  const handleDeleteTag = (tag) => {
    Modal.confirm({
      title: t('manageCategoriesTags.deleteTag', 'Delete Tag'),
      content: t('manageCategoriesTags.deleteTagConfirm', `Are you sure you want to delete tag "${tag.name}"?`),
      okText: t('common.delete', 'Delete'),
      okType: 'danger',
      cancelText: t('common.cancel', 'Cancel'),
      onOk: async () => {
        try {
          await apiClient.delete(`${API_ENDPOINTS.TAGS}/${tag.id}`);
          notification.success({
            message: t('common.success'),
            description: t('manageCategoriesTags.tagDeleted', 'Tag deleted successfully'),
            placement: 'topRight'
          });
          fetchData();
        } catch (error) {
          notification.error({
            message: t('common.error'),
            description: t('manageCategoriesTags.errorDeletingTag', 'Error deleting tag'),
            placement: 'topRight'
          });
        }
      }
    });
  };
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (modalType === 'add-category') {
        await apiClient.post(API_ENDPOINTS.CATEGORIES.BASE, values);
        notification.success({
          message: t('common.success'),
          description: t('manageCategoriesTags.categoryCreated', 'Category created successfully'),
          placement: 'topRight'
        });
      } else if (modalType === 'edit-category') {
        await apiClient.put(`${API_ENDPOINTS.CATEGORIES.BASE}/${editingItem.id}`, values);
        notification.success({
          message: t('common.success'),
          description: t('manageCategoriesTags.categoryUpdated', 'Category updated successfully'),
          placement: 'topRight'
        });
      } else if (modalType === 'add-tag') {
        await apiClient.post(API_ENDPOINTS.TAGS, values);
        notification.success({
          message: t('common.success'),
          description: t('manageCategoriesTags.tagCreated', 'Tag created successfully'),
          placement: 'topRight'
        });
      } else if (modalType === 'edit-tag') {
        await apiClient.put(`${API_ENDPOINTS.TAGS}/${editingItem.tag.id}`, values);
        notification.success({
          message: t('common.success'),
          description: t('manageCategoriesTags.tagUpdated', 'Tag updated successfully'),
          placement: 'topRight'
        });
      }
      setModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      notification.error({
        message: t('common.error'),
        description: error.response?.data?.detail || t('manageCategoriesTags.errorSaving', 'Error saving data'),
        placement: 'topRight'
      });
    }
  };
  const getModalTitle = () => {
    switch (modalType) {
      case 'add-category': return t('manageCategoriesTags.addCategory', 'Add Category');
      case 'edit-category': return t('manageCategoriesTags.editCategory', 'Edit Category');
      case 'add-tag': return t('manageCategoriesTags.addTag', 'Add Tag');
      case 'edit-tag': return t('manageCategoriesTags.editTag', 'Edit Tag');
      default: return '';
    }
  };
  const handleExpandAll = () => {
    setExpandedKeys(allKeys);
  };
  const handleCollapseAll = () => {
    setExpandedKeys([]);
  };
  const isAllExpanded = expandedKeys.length === allKeys.length;
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1f1f1f]"
            >
              <MenuOutlined className="text-xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('manageCategoriesTags.title', 'Manage Categories & Tags')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('manageCategoriesTags.subtitle', 'Organize prompts with categories and tags')}</p>
            </div>
          </div>
          <Space>
            <Button
              icon={isAllExpanded ? <ShrinkOutlined /> : <ExpandOutlined />}
              onClick={isAllExpanded ? handleCollapseAll : handleExpandAll}
            >
              {isAllExpanded 
                ? t('manageCategoriesTags.collapseAll', 'Collapse All')
                : t('manageCategoriesTags.expandAll', 'Expand All')
              }
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCategory}
            >
              {t('manageCategoriesTags.addCategory', 'Add Category')}
            </Button>
          </Space>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <div className="bg-white dark:bg-[#141414] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <Tree
              treeData={treeData}
              expandedKeys={expandedKeys}
              onExpand={setExpandedKeys}
              showLine
              showIcon={false}
            />
          </div>
        )}
      </div>
      <Modal
        title={getModalTitle()}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        okText={t('common.save', 'Save')}
        cancelText={t('common.cancel', 'Cancel')}
      >
        <Form form={form} layout="vertical" className="mt-4">
          {(modalType === 'add-category' || modalType === 'edit-category') && (
            <>
              <Form.Item
                name="name"
                label={t('manageCategoriesTags.categoryName', 'Category Name')}
                rules={[{ required: true, message: t('manageCategoriesTags.categoryNameRequired', 'Please enter category name') }]}
              >
                <Input placeholder={t('manageCategoriesTags.categoryNamePlaceholder', 'e.g., Development, Marketing')} />
              </Form.Item>
              <Form.Item
                name="slug"
                label={t('manageCategoriesTags.slug', 'Slug')}
                help={t('manageCategoriesTags.slugHelp', 'Leave empty to auto-generate from name')}
              >
                <Input placeholder={t('manageCategoriesTags.slugPlaceholder', 'e.g., development, marketing')} />
              </Form.Item>
            </>
          )}
          {(modalType === 'add-tag' || modalType === 'edit-tag') && (
            <>
              <Form.Item
                name="category_id"
                label={t('manageCategoriesTags.category', 'Category')}
                rules={[{ required: true, message: t('manageCategoriesTags.categoryRequired', 'Please select category') }]}
              >
                <Select placeholder={t('manageCategoriesTags.selectCategory', 'Select category')} disabled={modalType === 'add-tag'}>
                  {categories
                    .filter(cat => cat.slug !== 'other')
                    .map(cat => (
                      <Select.Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </Select.Option>
                    ))
                  }
                </Select>
              </Form.Item>
              <Form.Item
                name="name"
                label={t('manageCategoriesTags.tagName', 'Tag Name')}
                rules={[{ required: true, message: t('manageCategoriesTags.tagNameRequired', 'Please enter tag name') }]}
              >
                <Input placeholder={t('manageCategoriesTags.tagNamePlaceholder', 'e.g., React, Python, SEO')} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};
export default ManageCategoriesTags;
