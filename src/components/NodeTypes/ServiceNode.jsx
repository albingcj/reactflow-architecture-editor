import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const ServiceNode = ({ data }) => {
  return (
    <div className="px-4 pt-4 pb-2 rounded-lg bg-white border border-gray-200 shadow-sm text-center">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex flex-col items-center gap-2">
        <img 
          src={data.icon} 
          alt={data.label} 
          className="w-12 h-12 object-contain" 
        />
        <div className="text-sm font-medium text-gray-700 truncate w-full">
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

export default memo(ServiceNode);
