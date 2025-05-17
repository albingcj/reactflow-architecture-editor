import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addChatMessage } from "../../store/diagramSlice";
import ChatMessage from "./ChatMessage";
import { useServiceSearch } from "../../hooks/useServiceSearch";
import awsServices from "../../assets/aws-services.json";

const ChatPanel = ({ isCollapsed, onToggleCollapse }) => {
  const dispatch = useDispatch();
  const chatMessages = useSelector((state) => state.diagram.chatMessages);
  const [input, setInput] = useState("");
  const { searchResults, setSearchTerm } = useServiceSearch();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (!isCollapsed) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isCollapsed]);

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
      setSearchTerm(searchTerm);

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
    <div
      className={`bg-white border-l border-gray-200 h-full flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-12" : "w-72"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h3 className="text-base font-medium text-gray-700">
            Diagram Assistant
          </h3>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          title={
            isCollapsed ? "Expand assistant panel" : "Collapse assistant panel"
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isCollapsed ? (
              // Chat/message icon when collapsed

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            ) : (
              // Arrow collapse icon when expanded
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            )}
          </svg>
        </button>
      </div>

      {isCollapsed ? (
        <div className="flex flex-col items-center gap-2 py-3">
          {chatMessages.length > 0 && (
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs animate-pulse">
              {chatMessages.length}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8">
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  Welcome to the Architecture Diagram Builder!
                </h4>
                <p className="text-gray-500 mb-4">
                  You can use this assistant to help you build your diagram.
                </p>
                <p className="text-gray-600 font-medium mb-2">
                  Try commands like:
                </p>
                <ul className="text-gray-500 text-left mx-auto inline-block">
                  <li className="mb-1">• "add EC2"</li>
                  <li className="mb-1">• "find database services"</li>
                  <li className="mb-1">• "undo"</li>
                  <li className="mb-1">• "clear"</li>
                </ul>
              </div>
            ) : (
              chatMessages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            className="border-t border-gray-200 p-3 flex gap-2"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a command or ask for help..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatPanel;
