import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addChatMessage } from "../../store/diagramSlice";
import ChatMessage from "./ChatMessage";
import awsServices from "../../assets/aws-services.json";

const ChatPanel = ({ isCollapsed, onToggleCollapse }) => {
  const dispatch = useDispatch();
  const chatMessages = useSelector((state) => state.diagram.chatMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (!isCollapsed) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isCollapsed]);

  const handleToggleCollapse = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onToggleCollapse();
      setIsAnimating(false);
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    dispatch(
      addChatMessage({
        id: Date.now(),
        sender: "user",
        text: input,
      })
    );

    // Process command
    processCommand(input);

    setInput("");
  };

  const processCommand = (command) => {
    const lowerCommand = command.toLowerCase();

    // Handle undo command
    if (lowerCommand === "undo") {
      dispatch({ type: "diagram/undo" });
      dispatch(
        addChatMessage({
          id: Date.now() + 1,
          sender: "bot",
          text: "Undoing last action.",
        })
      );
      return;
    }

    // Handle redo command
    if (lowerCommand === "redo") {
      dispatch({ type: "diagram/redo" });
      dispatch(
        addChatMessage({
          id: Date.now() + 1,
          sender: "bot",
          text: "Redoing last undone action.",
        })
      );
      return;
    }

    // Handle clear command
    if (lowerCommand === "clear" || lowerCommand === "clear all") {
      dispatch({ type: "diagram/setNodes", payload: [] });
      dispatch({ type: "diagram/setEdges", payload: [] });
      dispatch(
        addChatMessage({
          id: Date.now() + 1,
          sender: "bot",
          text: "Cleared the diagram.",
        })
      );
      return;
    }

    // Handle search for services
    if (lowerCommand.startsWith("find") || lowerCommand.startsWith("search")) {
      const searchTerm = command.split(" ").slice(1).join(" ");

      setTimeout(() => {
        const filteredServices = Object.keys(awsServices)
          .filter((service) =>
            service.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((service) => ({
            name: service,
            icon: awsServices[service],
          }));

        if (filteredServices.length > 0) {
          dispatch(
            addChatMessage({
              id: Date.now() + 1,
              sender: "bot",
              text: `Found ${filteredServices.length} services matching "${searchTerm}". You can drag them from the results.`,
              results: filteredServices,
            })
          );
        } else {
          dispatch(
            addChatMessage({
              id: Date.now() + 1,
              sender: "bot",
              text: `No services found matching "${searchTerm}".`,
            })
          );
        }
      }, 300);
      return;
    }

    // Handle add service command
    if (lowerCommand.startsWith("add")) {
      const serviceName = command.split(" ").slice(1).join(" ");
      const matchingServices = Object.keys(awsServices).filter((service) =>
        service.toLowerCase().includes(serviceName.toLowerCase())
      );

      if (matchingServices.length === 1) {
        const service = matchingServices[0];
        const newNode = {
          id: `node-${Date.now()}`,
          type: "service",
          position: { x: 250, y: 250 },
          data: {
            label: service,
            icon: awsServices[service],
          },
        };

        dispatch({ type: "diagram/addNode", payload: newNode });
        dispatch(
          addChatMessage({
            id: Date.now() + 1,
            sender: "bot",
            text: `Added ${service} to the diagram.`,
          })
        );
      } else if (matchingServices.length > 1) {
        dispatch(
          addChatMessage({
            id: Date.now() + 1,
            sender: "bot",
            text: `Found multiple matching services. Please be more specific:`,
            results: matchingServices.map((service) => ({
              name: service,
              icon: awsServices[service],
            })),
          })
        );
      } else {
        dispatch(
          addChatMessage({
            id: Date.now() + 1,
            sender: "bot",
            text: `Sorry, I couldn't find a service named "${serviceName}".`,
          })
        );
      }
      return;
    }

    // Default response for unrecognized commands
    dispatch(
      addChatMessage({
        id: Date.now() + 1,
        sender: "bot",
        text: `I understand commands like:
      - "add [service]" - Add a service to the diagram
      - "find [term]" - Search for services
      - "undo" - Undo last action
      - "redo" - Redo last undone action
      - "clear" - Clear the diagram`,
      })
    );
  };

  return (
    <div className="relative h-full">
      {/* Fixed-width container that doesn't change size during animation */}
      <div
        className={`absolute top-0 right-0 h-full shadow-lg bg-white border-l border-gray-200 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-12" : "w-80"
        }`}
        style={{ zIndex: 10 }}
      >
        {/* Header */}
        <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center h-14 px-1 border-b border-gray-200`}>
  {!isCollapsed && (
    <div className="flex items-center space-x-2 overflow-hidden">
      <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-white"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h3 className="font-medium text-gray-800 truncate animate-fade-in">
        Diagram Assistant
      </h3>
    </div>
  )}
  <button
    onClick={handleToggleCollapse}
    disabled={isAnimating}
    className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
      isCollapsed ? 'mx-auto' : ''
    }`}
    title={isCollapsed ? "Expand assistant panel" : "Collapse assistant panel"}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
        isCollapsed ? "" : "transform rotate-180"
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {isCollapsed ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
        />
      )}
    </svg>
  </button>
</div>


        {/* Content */}
        <div
          className={`h-[calc(100%-3.5rem)] flex flex-col ${
            isCollapsed ? "hidden" : "animate-fade-in"
          }`}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-800 mb-3">
                  Welcome to the Architecture Diagram Builder!
                </h4>
                <p className="text-gray-600 mb-5 max-w-xs mx-auto">
                  I can help you build your AWS architecture diagram with simple
                  commands.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 max-w-xs mx-auto text-left border border-gray-200">
                  <p className="text-gray-700 font-medium mb-2">
                    Try commands like:
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <span className="text-primary-500 mr-2">•</span> "add EC2"
                    </li>
                    <li className="flex items-center">
                      <span className="text-primary-500 mr-2">•</span> "find
                      database"
                    </li>
                    <li className="flex items-center">
                      <span className="text-primary-500 mr-2">•</span> "undo" or
                      "redo"
                    </li>
                    <li className="flex items-center">
                      <span className="text-primary-500 mr-2">•</span> "clear"
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              chatMessages.map((message, index) => (
                <div
                  key={message.id}
                  className="animate-[fadeInUp_0.3s_ease-out]"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ChatMessage message={message} />
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form
            className="border-t border-gray-200 p-3 flex gap-2 bg-white"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a command or ask for help..."
              className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={`text-white rounded-full w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 ${
                input.trim()
                  ? "bg-primary-500 hover:bg-primary-600 shadow-md"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>

        {/* Collapsed view badge */}
        {isCollapsed && chatMessages.length > 0 && (
          <div className="flex flex-col items-center gap-2 py-3">
            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs shadow-md animate-pulse-slow">
              {chatMessages.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
