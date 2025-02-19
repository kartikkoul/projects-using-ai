import React, { useState } from 'react';
import { PencilIcon, TrashIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import { workItemService } from '../services/workItemService';

const WorkItem = ({ item, onEdit, onDelete, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSubItemForm, setShowSubItemForm] = useState(false);
  const [subItemText, setSubItemText] = useState('');
  const [editingSubItem, setEditingSubItem] = useState(null);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddSubItem = async (e) => {
    e.preventDefault();
    if (subItemText.trim()) {
      try {
        const updatedWorkItem = await workItemService.addSubItem(item._id, {
          description: subItemText
        });
        onUpdate(updatedWorkItem);
        setSubItemText('');
        setShowSubItemForm(false);
      } catch (error) {
        console.error('Error adding sub-item:', error);
      }
    }
  };

  const handleEditSubItem = async (subItem) => {
    try {
      const updatedWorkItem = await workItemService.updateSubItem(
        item._id,
        subItem._id,
        { description: subItemText }
      );
      onUpdate(updatedWorkItem);
      setSubItemText('');
      setEditingSubItem(null);
    } catch (error) {
      console.error('Error updating sub-item:', error);
    }
  };

  const handleDeleteSubItem = async (subItemId) => {
    if (window.confirm('Are you sure you want to delete this update?')) {
      try {
        const updatedWorkItem = await workItemService.deleteSubItem(item._id, subItemId);
        onUpdate(updatedWorkItem);
      } catch (error) {
        console.error('Error deleting sub-item:', error);
      }
    }
  };

  const toggleExpand = (e) => {
    if (!e.target.closest('.action-button')) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`work-item ${isExpanded ? 'expanded' : ''}`}>
      <div className="work-item-header" onClick={toggleExpand}>
        <div className="work-item-main">
          <div className="work-item-expand">
            <ChevronRightIcon className="h-4 w-4" />
          </div>
          <h3 className="work-item-title">{item.title}</h3>
          <span className={`work-item-status ${item.isCompleted ? 'completed' : 'pending'}`}>
            {item.isCompleted ? 'Completed' : 'In Progress'}
          </span>
        </div>
        <div className="work-item-actions">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onEdit(item); 
            }} 
            className="action-button edit-button"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onDelete(item); 
            }} 
            className="action-button delete-button"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="work-item-content">
        {item.description && (
          <p className="work-item-description">{item.description}</p>
        )}
        
        <div className="subitems-list">
          {item.subItems?.map((subItem) => (
            <div key={subItem._id} className="subitem">
              <div className="subitem-header">
                <span className="subitem-date">
                  {formatDateTime(subItem.createdAt)}
                </span>
                <div className="subitem-actions">
                  <button
                    onClick={() => {
                      setEditingSubItem(subItem);
                      setSubItemText(subItem.description);
                      setShowSubItemForm(true);
                    }}
                    className="action-button edit-button"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSubItem(subItem._id)}
                    className="action-button delete-button"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p>{subItem.description}</p>
            </div>
          ))}
        </div>

        {!showSubItemForm ? (
          <button
            onClick={() => {
              setShowSubItemForm(true);
              setEditingSubItem(null);
              setSubItemText('');
            }}
            className="add-subitem-button"
          >
            <PlusIcon className="h-4 w-4 inline-block mr-1" />
            Add Update
          </button>
        ) : (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (editingSubItem) {
                handleEditSubItem(editingSubItem);
              } else {
                handleAddSubItem(e);
              }
            }} 
            className="subitem-form"
          >
            <input
              type="text"
              value={subItemText}
              onChange={(e) => setSubItemText(e.target.value)}
              className="form-input"
              placeholder="Type your update here..."
              required
            />
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={() => {
                  setShowSubItemForm(false);
                  setEditingSubItem(null);
                  setSubItemText('');
                }} 
                className="button button-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                {editingSubItem ? 'Save' : 'Add'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WorkItem;
