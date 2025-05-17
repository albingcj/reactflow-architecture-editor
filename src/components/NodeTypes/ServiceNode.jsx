import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const ServiceNode = ({ data, id, selected }) => {
  return (
    <div className={`relative group flex flex-col items-center`}>
      {/* Card for image */}
      <div className={`bg-white shadow-md rounded-lg p-3 w-16 h-16 flex items-center justify-center relative 
        ${selected ? 'bg-blue-50 ring-2 ring-blue-500 rounded-xl ring-offset-2' : ''} `}>
          {/* Connection handles - all invisible until hover */}
        <div className="absolute w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Top handles */}
          <Handle
            type="source"
            position={Position.Top}
            id="top-source"
            style={{ 
              top: -6, 
              left: "35%", 
              backgroundColor: "#3b82f6",
              border: "2px solid white"
            }}
          />
          <Handle
            type="target"
            position={Position.Top}
            id="top-target"
            style={{ 
              top: -6, 
              left: "65%", 
              backgroundColor: "#10b981",
              border: "2px solid white"
            }}
          />
          
          {/* Right handles */}
          <Handle
            type="source"
            position={Position.Right}
            id="right-source"
            style={{ 
              right: -6, 
              top: "35%",
              backgroundColor: "#3b82f6",
              border: "2px solid white"
            }}
          />
          <Handle
            type="target"
            position={Position.Right}
            id="right-target"
            style={{ 
              right: -6, 
              top: "65%",
              backgroundColor: "#10b981",
              border: "2px solid white"
            }}
          />
          
          {/* Bottom handles */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom-source"
            style={{ 
              bottom: -6, 
              left: "35%",
              backgroundColor: "#3b82f6",
              border: "2px solid white"
            }}
          />
          <Handle
            type="target"
            position={Position.Bottom}
            id="bottom-target"
            style={{ 
              bottom: -6, 
              left: "65%",
              backgroundColor: "#10b981",
              border: "2px solid white"
            }}
          />
          
          {/* Left handles */}
          <Handle
            type="source"
            position={Position.Left}
            id="left-source"
            style={{ 
              left: -6, 
              top: "35%",
              backgroundColor: "#3b82f6",
              border: "2px solid white"
            }}
          />
          <Handle
            type="target"
            position={Position.Left}
            id="left-target"
            style={{ 
              left: -6, 
              top: "65%",
              backgroundColor: "#10b981",
              border: "2px solid white"
            }}
          />
        </div>
        
        <img
          src={data.icon}
          alt={data.label}
          className="max-w-full max-h-full object-contain"
        />
      </div>
      
      {/* Text below the card */}
      <div className={`mt-2 text-center text-xs font-medium ${selected ? 'text-blue-700' : 'text-gray-700'} max-w-[100px] break-words`}>
        {data.label}
      </div>
      
       {selected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Delete button appears on hover */}
       <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button 
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            if (data.onRemove) data.onRemove(id);
          }}
          title="Delete node"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default memo(ServiceNode);
