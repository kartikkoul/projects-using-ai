import React, { useState } from 'react';
import { PencilIcon, TrashIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import { workItemService } from '../services/workItemService';

const WorkItem = ({ item, onEdit, onDelete, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSubItemForm, setShowSubItemForm] = useState(false);
  const [subItemText, setSubItemText] = useState('');
  const [editingSubItem, setEditingSubItem] = useState(null);
  const [isDeleteSubItemModalOpen, setIsDeleteSubItemModalOpen] = useState(false);
  const [subItemToDelete, setSubItemToDelete] = useState(null);

  const getDateRange = (item) => {
    const startDate = new Date(item.startDate);
    let endDate;

    if (item.subItems && item.subItems.length > 0) {
      // Get the date of the latest subitem
      const latestSubItem = item.subItems[item.subItems.length - 1];
      endDate = new Date(latestSubItem.createdAt);
    } else {
      endDate = new Date(item.updatedAt);
    }

    return {
      start: formatDateTime(startDate),
      end: formatDateTime(endDate),
      isOngoing: !item.isCompleted
    };
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSubItemDate = (date) => {
    const now = new Date();
    const itemDate = new Date(date);
    const diffInHours = Math.floor((now - itemDate) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - itemDate) / (1000 * 60));
        return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    if (itemDate.getFullYear() === now.getFullYear()) {
      return itemDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
    
    return itemDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  const handleDeleteSubItem = async () => {
    try {
      const updatedWorkItem = await workItemService.deleteSubItem(item._id, subItemToDelete._id);
      onUpdate(updatedWorkItem);
      setIsDeleteSubItemModalOpen(false);
      setSubItemToDelete(null);
    } catch (error) {
      console.error('Error deleting sub-item:', error);
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
          <div className="work-item-info">
            <h3 className="work-item-title">{item.title}</h3>
            <div className="work-item-dates">
              {(() => {
                const { start, end, isOngoing } = getDateRange(item);
                return (
                  <span className="work-item-date-range">
                    {start} {isOngoing ? ' - Ongoing' : ` - ${end}`}
                  </span>
                );
              })()}
            </div>
          </div>
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
            style={{ cursor: 'pointer', color: '#3b82f6' }} /* Ensure the icon color is more visible */
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onDelete(item); 
            }} 
            className="action-button delete-button"
            style={{ cursor: 'pointer' }}
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
                  {formatSubItemDate(subItem.createdAt)}
                </span>
                <div className="subitem-actions">
                  <button
                    onClick={() => {
                      setEditingSubItem(subItem);
                      setSubItemText(subItem.description);
                      setShowSubItemForm(true);
                    }}
                    className="action-button edit-button"
                    style={{ cursor: 'pointer', color: '#3b82f6' }} /* Ensure the icon color is more visible */
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSubItemToDelete(subItem);
                      setIsDeleteSubItemModalOpen(true);
                    }}
                    className="action-button delete-button"
                    style={{ cursor: 'pointer' }}
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
            style={{ cursor: 'pointer' }}
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
                style={{ cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary" style={{ cursor: 'pointer' }}>
                {editingSubItem ? 'Save' : 'Add'}
              </button>
            </div>
          </form>
        )}
      </div>

      {isDeleteSubItemModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal-container">
            <h3 className="delete-modal-title">Delete Sub-Item</h3>
            <p className="delete-modal-message">
              Are you sure you want to delete this sub-item?
            </p>
            <div className="delete-modal-actions">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteSubItemModalOpen(false);
                  setSubItemToDelete(null);
                }}
                className="button button-secondary"
                style={{ cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubItem}
                className="button button-delete"
                style={{ cursor: 'pointer' }}
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

export default WorkItem;
