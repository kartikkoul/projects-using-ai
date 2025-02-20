import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import WorkItem from './WorkItem';

const WorkItemsList = ({ 
  category, 
  workItems, 
  onAddItem, 
  onEditItem, 
  onDeleteItem,
  onUpdateItem 
}) => {
  return (
    <div className="work-items-section" style={{"--delay": 1}}>
      <div className="work-items-header">
        <h2 className="work-items-title">
          {category.description}
        </h2>
        <button
          onClick={() => onAddItem(category._id)}
          className="add-work-item-button"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Work Item
        </button>
      </div>

      <div className="work-items-list">
        {workItems.map((item, index) => (
          <WorkItem
            key={item._id}
            item={item}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
            onUpdate={onUpdateItem}
            style={{"--index": index}}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkItemsList;
