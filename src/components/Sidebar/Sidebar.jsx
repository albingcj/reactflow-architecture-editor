import React, { useState, useRef, useEffect } from "react";
import awsServices from "../../assets/aws-services.json";
import { serviceCategories } from "../../utils/serviceCategories";

const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllResults, setShowAllResults] = useState(false);

  // Animation states
  const [animateIcon, setAnimateIcon] = useState(false);
  const [animateButton, setAnimateButton] = useState(false);
  const searchInputRef = useRef(null);
  const accordionContentRef = useRef(null);

  // Toggle accordion functionality
  const toggleAccordion = (category) => {
    setActiveAccordion(activeAccordion === category ? null : category);
  };

  // Handle animation when sidebar state changes
  useEffect(() => {
    if (!isCollapsed) {
      // When expanding, briefly show animation then focus search
      setAnimateButton(true);
      setAnimateIcon(true);

      // Reset animations and focus search after animation completes
      const timer = setTimeout(() => {
        setAnimateIcon(false);
        setAnimateButton(false);
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 200); // Reduced from 400ms
      return () => clearTimeout(timer);
    } else {
      // When collapsing, animate button and reset icon
      setAnimateButton(true);
      setAnimateIcon(false);

      // Reset button animation after collapse
      const timer = setTimeout(() => {
        setAnimateButton(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isCollapsed]);

  // Calculate which categories contain search matches
  const getCategoriesWithMatches = () => {
    if (!searchTerm) return {};

    const matches = {};
    Object.keys(serviceCategories).forEach((category) => {
      const services = serviceCategories[category];
      const hasMatch = services.some(
        (service) =>
          service.toLowerCase().includes(searchTerm.toLowerCase()) &&
          awsServices[service]
      );
      matches[category] = hasMatch;
    });
    return matches;
  };

  // Get search results across all categories
  const getSearchResults = () => {
    if (!searchTerm) return [];

    return Object.keys(awsServices)
      .filter((service) =>
        service.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((service) => ({
        name: service,
        icon: awsServices[service],
        category: findCategoryForService(service),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Find which category a service belongs to
  const findCategoryForService = (service) => {
    for (const [category, services] of Object.entries(serviceCategories)) {
      if (services.includes(service)) {
        return category;
      }
    }
    return "Other";
  };

  const handleDragStart = (event, service) => {
    const serviceData = {
      name: service,
      icon: awsServices[service],
    };
    event.dataTransfer.setData("application/json", JSON.stringify(serviceData));
    event.dataTransfer.effectAllowed = "move";
  };

  // Reset search state when search term is cleared
  useEffect(() => {
    if (!searchTerm) {
      setShowAllResults(false);
    }
  }, [searchTerm]);

  // Get search results
  const searchResults = getSearchResults();
  const categoriesWithMatches = getCategoriesWithMatches();

  // Render service item with proper draggability
  const renderServiceItem = (service) => {
    if (!awsServices[service]) return null;

    const isMatch =
      searchTerm && service.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      <div
        key={service}
        className={`flex items-center gap-2 p-2 bg-white rounded border ${
          isMatch ? "border-blue-300 ring-1 ring-blue-200" : "border-gray-200"
        } cursor-grab hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400`}
        draggable
        onDragStart={(e) => handleDragStart(e, service)}
        tabIndex={0}
      >
        <img
          src={awsServices[service]}
          alt={service}
          className="w-6 h-6 object-contain flex-shrink-0"
        />
        <span
          className={`text-sm ${
            isMatch ? "text-blue-700 font-medium" : "text-gray-700"
          } truncate`}
        >
          {service}
        </span>
      </div>
    );
  };

  // Keyframe animations defined inline to ensure they exist
  const animationStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes moveSearchIcon {
      from { 
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      to { 
        transform: translate(12px, 0px) scale(0.8);
        opacity: 0;
      }
    }
    
    @keyframes slideButtonRight {
      from { 
        transform: translateX(-10px);
        opacity: 0.7;
      }
      to { 
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideButtonLeft {
      from { 
        transform: translateX(0);
        opacity: 1;
      }
      to { 
        transform: translateX(-10px);
        opacity: 0.7;
      }
    }
  `;

  // Get button animation style
  const getButtonStyle = () => {
    if (!animateButton) return {};

    return {
      animation: isCollapsed
        ? "slideButtonLeft 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards"
        : "slideButtonRight 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
    };
  };

  // CSS for animations - faster now
  const fadeInStyle = {
    animation: "fadeIn 0.2s ease-out forwards",
  };

  return (
    <>
      <style>{animationStyles}</style>
      <div
        className={`bg-gray-50 border-r border-gray-200 h-full flex flex-col transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-12" : "w-64"
        } relative`}
      >
        <div
          className={`flex ${
            isCollapsed ? "justify-center" : "items-center"
          } p-4 border-b border-gray-200`}
        >
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
            title={
              isCollapsed ? "Expand services panel" : "Collapse services panel"
            }
            style={getButtonStyle()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isCollapsed ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              )}
            </svg>
          </button>
          {!isCollapsed && (
            <h3 className="text-base font-medium ml-2 whitespace-nowrap">
              AWS Services
            </h3>
          )}
        </div>

        {isCollapsed ? (
          <div className="flex flex-col items-center py-4">
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors group focus:outline-none focus:ring-2 focus:ring-blue-400"
              title="Search services"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500 transition-transform group-hover:scale-110 duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div style={fadeInStyle} className="flex flex-col h-full">
            {/* Search */}
            <div className="p-3 border-b border-gray-200 flex-shrink-0">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 pl-9 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchTerm && (
                  <button
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-800"
                    onClick={() => setSearchTerm("")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Search Results */}
            {searchTerm && searchResults.length > 0 && (
              <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Search Results
                </h4>
                <div
                  className={`flex flex-col gap-1.5 overflow-y-auto relative ${
                    showAllResults ? "max-h-[29vh]" : "max-h-[100%]"
                  }`}
                >
                  {(showAllResults
                    ? searchResults
                    : searchResults.slice(0, 3)
                  ).map((result) => (
                    <div
                      key={result.name}
                      className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 cursor-grab hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                      draggable
                      onDragStart={(e) => handleDragStart(e, result.name)}
                      tabIndex={0}
                    >
                      <img
                        src={result.icon}
                        alt={result.name}
                        className="w-6 h-6 object-contain flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {result.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {result.category}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Sticky Button */}
                  {searchResults.length > 3 && (
                    <div className="sticky bottom-0 bg-gray-50 py-2">
                      <button
                        onClick={() => setShowAllResults(!showAllResults)}
                        className="text-sm text-blue-500 hover:text-blue-700 flex items-center justify-center py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                      >
                        {showAllResults
                          ? "Show Less"
                          : `Show All (${searchResults.length})`}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 ml-1 transform transition-transform ${
                            showAllResults ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Categories as Accordions */}
            <div className="flex-1 overflow-y-auto" ref={accordionContentRef}>
              {Object.keys(serviceCategories).map((category, index) => {
                const hasMatches = categoriesWithMatches[category];
                const services = serviceCategories[category] || [];

                return (
                  <div
                    key={category}
                    className="border-b border-gray-200"
                    style={{
                      ...fadeInStyle,
                      animationDelay: `${30 + index * 20}ms`, // Faster animation delays
                    }}
                  >
                    <button
                      className={`w-full flex items-center justify-between p-3 text-left ${
                        activeAccordion === category
                          ? "bg-blue-50"
                          : "hover:bg-gray-100"
                      } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400`}
                      onClick={() => toggleAccordion(category)}
                    >
                      <div className="flex items-center">
                        <span className="font-medium text-sm text-gray-700 truncate">
                          {category}
                        </span>
                        {hasMatches && searchTerm && (
                          <span className="ml-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                        )}
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 text-gray-500 transform transition-transform flex-shrink-0 ${
                          activeAccordion === category ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {activeAccordion === category && (
                      <div className="p-3 bg-white">
                        <div className="flex flex-col gap-1.5 overflow-y-auto">
                          {services.map((service) =>
                            renderServiceItem(service)
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Animated search icon (shows during transition) */}
        {animateIcon && !isCollapsed && (
          <div
            className="absolute z-50 text-blue-500 pointer-events-none"
            style={{
              left: "10px",
              top: "82px",
              width: "20px",
              height: "20px",
              animation:
                "moveSearchIcon 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards", // Faster animation
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
