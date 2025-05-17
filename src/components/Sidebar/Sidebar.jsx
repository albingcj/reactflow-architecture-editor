import React, { useState } from 'react';
import awsServices from '../../assets/aws-services.json';
import { serviceCategories } from '../../utils/serviceCategories';

const Sidebar = () => {
  const [activeCategory, setActiveCategory] = useState('Compute');
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleDragStart = (event, service) => {
    const serviceData = {
      name: service,
      icon: awsServices[service]
    };
    
    event.dataTransfer.setData('application/json', JSON.stringify(serviceData));
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const renderServiceList = () => {
    if (searchTerm) {
      const filteredServices = Object.keys(awsServices)
        .filter(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      if (filteredServices.length === 0) {
        return <div className="text-center py-8 text-gray-500">No services found</div>;
      }
      
      return (
        <div className="flex flex-col gap-1.5 p-3">
          {filteredServices.map(service => (
            <div 
              key={service}
              className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 cursor-grab hover:bg-gray-50 transition-colors"
              draggable
              onDragStart={(e) => handleDragStart(e, service)}
            >
              <img 
                src={awsServices[service]} 
                alt={service} 
                className="w-6 h-6 object-contain" 
              />
              <span className="text-sm text-gray-700">{service}</span>
            </div>
          ))}
        </div>
      );
    }
    
    // If no search term, show by category
    const servicesInCategory = serviceCategories[activeCategory] || [];
    
    return (
      <div className="flex flex-col gap-1.5 p-3">
        {servicesInCategory.map(service => {
          if (!awsServices[service]) return null;
          
          return (
            <div 
              key={service}
              className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 cursor-grab hover:bg-gray-50 transition-colors"
              draggable
              onDragStart={(e) => handleDragStart(e, service)}
            >
              <img 
                src={awsServices[service]} 
                alt={service} 
                className="w-6 h-6 object-contain" 
              />
              <span className="text-sm text-gray-700">{service}</span>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full flex flex-col">
      <h3 className="text-base font-medium p-4 border-b border-gray-200">AWS Services</h3>
      <div className="relative p-3">
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button 
            className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
            onClick={() => setSearchTerm('')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {!searchTerm && (
        <div className="flex flex-wrap border-b border-gray-200 px-2">
          {Object.keys(serviceCategories).map(category => (
            <button
              key={category}
              className={`px-3 py-2 text-xs font-medium rounded-t-md ${
                activeCategory === category 
                  ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        {renderServiceList()}
      </div>
    </div>
  );
};

export default Sidebar;
