import React from 'react';
import { useDispatch } from 'react-redux';

const ChatMessage = ({ message }) => {
  const dispatch = useDispatch();
  const { sender, text, results } = message;
  
  const handleDragStart = (event, service) => {
    const serviceData = {
      name: service.name,
      icon: service.icon
    };
    
    event.dataTransfer.setData('application/json', JSON.stringify(serviceData));
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const handleServiceClick = (service) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'service',
      position: { x: 250, y: 250 },
      data: { 
        label: service.name,
        icon: service.icon
      },
    };
    
    dispatch({ type: 'diagram/addNode', payload: newNode });
  };
  
  return (
    <div className={`max-w-[85%] rounded-2xl p-3 ${
      sender === 'user' 
        ? 'bg-blue-500 text-white ml-auto rounded-br-sm' 
        : 'bg-gray-100 text-gray-800 mr-auto rounded-bl-sm'
    }`}>
      <div className="space-y-2">
        {text.split('\n').map((line, i) => (
          <p key={i} className="text-sm">{line}</p>
        ))}
        
        {results && results.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-200">
            {results.map(service => (
              <div 
                key={service.name}
                className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700 cursor-pointer hover:bg-gray-50"
                draggable
                onDragStart={(e) => handleDragStart(e, service)}
                onClick={() => handleServiceClick(service)}
              >
                <img 
                  src={service.icon} 
                  alt={service.name} 
                  className="w-4 h-4 object-contain" 
                />
                <span>{service.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
