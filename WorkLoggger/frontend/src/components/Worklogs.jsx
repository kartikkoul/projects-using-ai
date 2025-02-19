import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import { workItemService } from '../services/workItemService';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import WorkItemsList from './WorkItemsList';
import '../styles/Worklogs.css';

const Worklogs = () => {
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [workItems, setWorkItems] = useState([]);
  const [isWorkItemModalOpen, setIsWorkItemModalOpen] = useState(false);
  const [isDeleteWorkItemModalOpen, setIsDeleteWorkItemModalOpen] = useState(false);
  const [workItemToDelete, setWorkItemToDelete] = useState(null);
  const [editingWorkItem, setEditingWorkItem] = useState(null);
  const [workItemFormData, setWorkItemFormData] = useState({
    title: '',
    description: '',
    isCompleted: false
  });
  const [workItemsByCategory, setWorkItemsByCategory] = useState({});

  useEffect(() => {
    fetchCategories();
    fetchAllWorkItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAllWorkItems = async () => {
    try {
      const data = await workItemService.getAllWorkItems();
      const itemsByCategory = data.reduce((acc, item) => {
        const categoryId = item.category._id;
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        acc[categoryId].push(item);
        return acc;
      }, {});
      setWorkItemsByCategory(itemsByCategory);
      updateCategoryCounts(itemsByCategory);
    } catch (error) {
      console.error('Error fetching work items:', error);
    }
  };

  const updateCategoryCounts = (itemsByCategory) => {
    const counts = Object.entries(itemsByCategory).reduce((acc, [categoryId, items]) => {
      acc[categoryId] = items?.length || 0;
      return acc;
    }, {});
    setCategoryCounts(counts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await categoryService.deleteCategory(categoryToDelete._id);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const fetchWorkItems = async (categoryId) => {
    try {
      const data = await workItemService.getWorkItemsByCategory(categoryId);
      setWorkItems(data);
      const newWorkItemsByCategory = { ...workItemsByCategory };
      newWorkItemsByCategory[categoryId] = data;
      setWorkItemsByCategory(newWorkItemsByCategory);
    } catch (error) {
      console.error('Error fetching work items:', error);
    }
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    await fetchWorkItems(category._id);
  };

  const handleWorkItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemData = {
        ...workItemFormData,
        category: selectedCategory._id
      };

      let updatedItem;
      if (editingWorkItem) {
        updatedItem = await workItemService.updateWorkItem(editingWorkItem._id, itemData);
      } else {
        updatedItem = await workItemService.createWorkItem(itemData);
      }

      // Update workItemsByCategory and counts
      const newWorkItemsByCategory = { ...workItemsByCategory };
      const categoryId = selectedCategory._id;
      
      if (!newWorkItemsByCategory[categoryId]) {
        newWorkItemsByCategory[categoryId] = [];
      }

      if (editingWorkItem) {
        newWorkItemsByCategory[categoryId] = newWorkItemsByCategory[categoryId].map(item =>
          item._id === updatedItem._id ? updatedItem : item
        );
      } else {
        newWorkItemsByCategory[categoryId].push(updatedItem);
      }

      setWorkItemsByCategory(newWorkItemsByCategory);
      updateCategoryCounts(newWorkItemsByCategory);
      
      setIsWorkItemModalOpen(false);
      setEditingWorkItem(null);
      setWorkItemFormData({ title: '', description: '', isCompleted: false });
    } catch (error) {
      console.error('Error saving work item:', error);
    }
  };

  const handleWorkItemDelete = async () => {
    try {
      await workItemService.deleteWorkItem(workItemToDelete._id);
      
      // Update workItemsByCategory and counts
      const newWorkItemsByCategory = { ...workItemsByCategory };
      const categoryId = selectedCategory._id;
      
      newWorkItemsByCategory[categoryId] = newWorkItemsByCategory[categoryId].filter(
        item => item._id !== workItemToDelete._id
      );
      
      setWorkItemsByCategory(newWorkItemsByCategory);
      updateCategoryCounts(newWorkItemsByCategory);

      setIsDeleteWorkItemModalOpen(false);
      setWorkItemToDelete(null);
    } catch (error) {
      console.error('Error deleting work item:', error);
    }
  };

  const handleAddWorkItem = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    setSelectedCategory(category);
    setEditingWorkItem(null);
    setWorkItemFormData({ title: '', description: '', isCompleted: false });
    setIsWorkItemModalOpen(true);
  };

  const handleWorkItemUpdate = async (updatedItem) => {
    const newWorkItems = { ...workItemsByCategory };
    const categoryId = updatedItem.category._id;
    
    if (newWorkItems[categoryId]) {
      newWorkItems[categoryId] = newWorkItems[categoryId].map(item =>
        item._id === updatedItem._id ? updatedItem : item
      );
      setWorkItemsByCategory(newWorkItems);
    }
  };

  return (
    <div className="workLogsContainer">
      <nav className="categories-nav">
        <div className="categories-wrapper">
          <div className="categories-content">
            <div className="categories-list">
              {categories.map((category, index) => (
                <div 
                  key={category._id} 
                  className="category-item"
                  style={{"--index": index}}
                >
                  <button 
                    className={`category-button ${selectedCategory?._id === category._id ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category.name}
                    {categoryCounts[category._id] > 0 && (
                      <span className="category-count">
                        {categoryCounts[category._id]}
                      </span>
                    )}
                    <div className="category-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(category);
                        }}
                        className="action-button edit-button"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(category);
                        }}
                        className="action-button delete-button"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setFormData({ name: '', description: '' });
                setIsModalOpen(true);
              }}
              className="add-category-button"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Category
            </button>
          </div>
        </div>
      </nav>

      <div className="work-items-container">
        {selectedCategory ? (
          <WorkItemsList
            key={selectedCategory._id}
            category={selectedCategory}
            workItems={workItemsByCategory[selectedCategory._id] || []}
            onAddItem={handleAddWorkItem}
            onEditItem={(item) => {
              setSelectedCategory(selectedCategory);
              setEditingWorkItem(item);
              setWorkItemFormData({
                title: item.title,
                description: item.description,
                isCompleted: item.isCompleted
              });
              setIsWorkItemModalOpen(true);
            }}
            onDeleteItem={(item) => {
              setSelectedCategory(selectedCategory);
              setWorkItemToDelete(item);
              setIsDeleteWorkItemModalOpen(true);
            }}
            onUpdateItem={handleWorkItemUpdate}
          />
        ) : (
          <div className="no-selection-message">
            Please select a category to view work items
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3 className="modal-title">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="button button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal-container">
            <h3 className="delete-modal-title">Delete Category</h3>
            <p className="delete-modal-message">
              Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="delete-modal-actions">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                className="button button-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="button button-delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isWorkItemModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3 className="modal-title">
              {editingWorkItem ? 'Edit Work Item' : 'New Work Item'}
            </h3>
            <form onSubmit={handleWorkItemSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={workItemFormData.title}
                  onChange={(e) => setWorkItemFormData({
                    ...workItemFormData,
                    title: e.target.value
                  })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={workItemFormData.description}
                  onChange={(e) => setWorkItemFormData({
                    ...workItemFormData,
                    description: e.target.value
                  })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={workItemFormData.isCompleted}
                    onChange={(e) => setWorkItemFormData({
                      ...workItemFormData,
                      isCompleted: e.target.checked
                    })}
                  />
                  <span>Completed</span>
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsWorkItemModalOpen(false)}
                  className="button button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                >
                  {editingWorkItem ? 'Save Changes' : 'Create Work Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteWorkItemModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal-container">
            <h3 className="delete-modal-title">Delete Work Item</h3>
            <p className="delete-modal-message">
              Are you sure you want to delete "{workItemToDelete?.title}"?
            </p>
            <div className="delete-modal-actions">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteWorkItemModalOpen(false);
                  setWorkItemToDelete(null);
                }}
                className="button button-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWorkItemDelete}
                className="button button-delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Worklogs;
