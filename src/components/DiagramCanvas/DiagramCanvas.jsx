import React, { useCallback, useRef, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
} from "reactflow";
import { useDispatch, useSelector } from "react-redux";
import "reactflow/dist/style.css";
import ServiceNode from "../NodeTypes/ServiceNode";
import {
  setNodes,
  setEdges,
  addEdge as addEdgeAction,
  removeNode,
  removeEdge,
} from "../../store/diagramSlice";

// Define nodeTypes outside the component
const nodeTypes = {
  service: ServiceNode,
};

const DiagramCanvas = () => {
  const dispatch = useDispatch();
  const storeNodes = useSelector((state) => state.diagram.nodes);
  const storeEdges = useSelector((state) => state.diagram.edges);
  const historyCurrentStep = useSelector((state) => state.diagram.currentStep);
  const reactFlowWrapper = useRef(null);

  // State for UI elements
  const [trashVisible, setTrashVisible] = useState(false);
  const [isDraggingOverTrash, setIsDraggingOverTrash] = useState(false);
  const [minimapVisible, setMinimapVisible] = useState(true);

  // Selection state for alignment features
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [isAlignmentToolVisible, setIsAlignmentToolVisible] = useState(false);

  // State for nodes and edges
  const [nodes, setNodesState, onNodesChange] = useNodesState([]);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState([]);

  const lastHistoryStepRef = useRef(historyCurrentStep);

  // Initialize from Redux store
  useEffect(() => {
    if (storeNodes && storeNodes.length > 0) {
      // Update node data to include onRemove function
      const nodesWithCallbacks = storeNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onRemove: handleRemoveNode,
        },
      }));
      setNodesState(nodesWithCallbacks);
    } else {
      setNodesState([]);
    }

    setEdgesState(storeEdges || []);
  }, []);

  // Sync with Redux store when nodes change in local state
  useEffect(() => {
    // Only dispatch if not triggered by Redux update
    if (historyCurrentStep === lastHistoryStepRef.current) {
      dispatch(setNodes(nodes));
    }
  }, [nodes, dispatch]);

  // Sync with Redux store when edges change in local state
  useEffect(() => {
    // Only dispatch if not triggered by Redux update
    if (historyCurrentStep === lastHistoryStepRef.current) {
      dispatch(setEdges(edges));
    }
  }, [edges, dispatch]);

  // Sync from Redux store when undo/redo happens
  useEffect(() => {
    if (historyCurrentStep !== lastHistoryStepRef.current) {
      // Update nodes with callback functions
      if (storeNodes && storeNodes.length > 0) {
        const nodesWithCallbacks = storeNodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            onRemove: handleRemoveNode,
          },
        }));
        setNodesState(nodesWithCallbacks);
      } else {
        setNodesState([]);
      }

      setEdgesState(storeEdges || []);
      lastHistoryStepRef.current = historyCurrentStep;
    }
  }, [historyCurrentStep, storeNodes, storeEdges]);

  // Callback to handle node removal
  const handleRemoveNode = useCallback(
    (nodeId) => {
      dispatch(removeNode(nodeId));
    },
    [dispatch]
  );

  // Handle edge removal
  const onEdgeClick = useCallback(
    (event, edge) => {
      if (event.altKey || event.ctrlKey) {
        dispatch(removeEdge(edge.id));
      }
    },
    [dispatch]
  );

  // Connection handler
  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `e-${params.source}-${params.target}-${Date.now()}`,
        animated: false,
        type: "smoothstep",
        style: { stroke: "#555", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      };

      setEdgesState((eds) => addEdge(newEdge, eds));
      dispatch(addEdgeAction(newEdge));
    },
    [setEdgesState, dispatch]
  );

  // Drag and drop handlers
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      try {
        const serviceData = JSON.parse(
          event.dataTransfer.getData("application/json")
        );

        // Get canvas position
        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();
        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };

        // Create new node with remove callback
        const newNode = {
          id: `node-${Date.now()}`,
          type: "service",
          position,
          data: {
            label: serviceData.name,
            icon: serviceData.icon,
            onRemove: handleRemoveNode,
          },
        };

        setNodesState((nds) => nds.concat(newNode));
        dispatch({ type: "diagram/addNode", payload: newNode });
      } catch (error) {
        console.error("Error adding node:", error);
      }
    },
    [setNodesState, dispatch, handleRemoveNode]
  );

  // Trash bin handlers
  const onNodeDragStart = useCallback(() => {
    setTrashVisible(true);
  }, []);

  const onNodeDrag = useCallback((event, node) => {
    const trashElement = document.getElementById("trash-bin");
    if (trashElement) {
      const trashRect = trashElement.getBoundingClientRect();
      const isDraggingOver =
        event.clientX > trashRect.left &&
        event.clientX < trashRect.right &&
        event.clientY > trashRect.top &&
        event.clientY < trashRect.bottom;

      setIsDraggingOverTrash(isDraggingOver);
    }
  }, []);

  const onNodeDragStop = useCallback(
    (event, node) => {
      setTrashVisible(false);

      const trashElement = document.getElementById("trash-bin");
      if (trashElement) {
        const trashRect = trashElement.getBoundingClientRect();
        const isDroppedOnTrash =
          event.clientX > trashRect.left &&
          event.clientX < trashRect.right &&
          event.clientY > trashRect.top &&
          event.clientY < trashRect.bottom;

        if (isDroppedOnTrash) {
          dispatch(removeNode(node.id));
        }
      }

      setIsDraggingOverTrash(false);
    },
    [dispatch]
  );

  // Selection and alignment handlers
  const onSelectionChange = useCallback(({ nodes }) => {
    setSelectedNodes(nodes || []);
    setIsAlignmentToolVisible(nodes && nodes.length >= 2);
  }, []);

  const alignHorizontally = (position) => {
    if (selectedNodes.length < 2) return;

    // Find target Y position
    let targetY;
    if (position === "top") {
      targetY = Math.min(...selectedNodes.map((node) => node.position.y));
    } else if (position === "bottom") {
      targetY = Math.max(
        ...selectedNodes.map((node) => node.position.y + (node.height || 100))
      );
      targetY -= 100; // Adjust for node height
    } else {
      // center
      const centerPositions = selectedNodes.map(
        (node) => node.position.y + (node.height || 100) / 2
      );
      targetY =
        centerPositions.reduce((sum, pos) => sum + pos, 0) /
        selectedNodes.length;
      targetY -= 50; // Adjust for half node height
    }

    // Update node positions
    const updatedNodes = nodes.map((node) => {
      if (selectedNodes.some((selected) => selected.id === node.id)) {
        let newY = targetY;
        if (position === "center") {
          newY = targetY - (node.height || 100) / 2 + 50; // Adjust for center alignment
        } else if (position === "bottom") {
          newY = targetY - (node.height || 100) + 100; // Adjust for bottom alignment
        }

        return {
          ...node,
          position: { x: node.position.x, y: newY },
        };
      }
      return node;
    });

    setNodesState(updatedNodes);
  };

  const alignVertically = (position) => {
    if (selectedNodes.length < 2) return;

    // Find target X position
    let targetX;
    if (position === "left") {
      targetX = Math.min(...selectedNodes.map((node) => node.position.x));
    } else if (position === "right") {
      targetX = Math.max(
        ...selectedNodes.map((node) => node.position.x + (node.width || 100))
      );
      targetX -= 100; // Adjust for node width
    } else {
      // center
      const centerPositions = selectedNodes.map(
        (node) => node.position.x + (node.width || 100) / 2
      );
      targetX =
        centerPositions.reduce((sum, pos) => sum + pos, 0) /
        selectedNodes.length;
      targetX -= 50; // Adjust for half node width
    }

    // Update node positions
    const updatedNodes = nodes.map((node) => {
      if (selectedNodes.some((selected) => selected.id === node.id)) {
        let newX = targetX;
        if (position === "center") {
          newX = targetX - (node.width || 100) / 2 + 50; // Adjust for center alignment
        } else if (position === "right") {
          newX = targetX - (node.width || 100) + 100; // Adjust for right alignment
        }

        return {
          ...node,
          position: { x: newX, y: node.position.y },
        };
      }
      return node;
    });

    setNodesState(updatedNodes);
  };

  const distributeHorizontally = () => {
    if (selectedNodes.length < 3) return;

    // Sort nodes by x position
    const sortedNodes = [...selectedNodes].sort(
      (a, b) => a.position.x - b.position.x
    );

    // Calculate total available width
    const leftMostNode = sortedNodes[0];
    const rightMostNode = sortedNodes[sortedNodes.length - 1];
    const totalWidth = rightMostNode.position.x - leftMostNode.position.x;

    // Calculate equal spacing
    const spacing = totalWidth / (sortedNodes.length - 1);

    // Update positions
    const updatedNodes = nodes.map((node) => {
      const sortedIndex = sortedNodes.findIndex((n) => n.id === node.id);

      if (
        sortedIndex === -1 ||
        sortedIndex === 0 ||
        sortedIndex === sortedNodes.length - 1
      ) {
        return node;
      }

      return {
        ...node,
        position: {
          x: leftMostNode.position.x + spacing * sortedIndex,
          y: node.position.y,
        },
      };
    });

    setNodesState(updatedNodes);
  };

  const distributeVertically = () => {
    if (selectedNodes.length < 3) return;

    // Sort nodes by y position
    const sortedNodes = [...selectedNodes].sort(
      (a, b) => a.position.y - b.position.y
    );

    // Calculate total available height
    const topMostNode = sortedNodes[0];
    const bottomMostNode = sortedNodes[sortedNodes.length - 1];
    const totalHeight = bottomMostNode.position.y - topMostNode.position.y;

    // Calculate equal spacing
    const spacing = totalHeight / (sortedNodes.length - 1);

    // Update positions
    const updatedNodes = nodes.map((node) => {
      const sortedIndex = sortedNodes.findIndex((n) => n.id === node.id);

      if (
        sortedIndex === -1 ||
        sortedIndex === 0 ||
        sortedIndex === sortedNodes.length - 1
      ) {
        return node;
      }

      return {
        ...node,
        position: {
          x: node.position.x,
          y: topMostNode.position.y + spacing * sortedIndex,
        },
      };
    });

    setNodesState(updatedNodes);
  };

  // Toggle MiniMap
  const toggleMiniMap = () => {
    setMinimapVisible(!minimapVisible);
  };

  return (
    <div ref={reactFlowWrapper} className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onEdgeClick={onEdgeClick}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: "#555", strokeWidth: 2 },
        }}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        selectionMode={1}
      >
        <Background color="#aaa" gap={16} />
        <Controls />

        {/* Toggle button for MiniMap */}
        <Panel position="bottom-right" className="mr-14 mb-1 rounded">
          <button
            onClick={toggleMiniMap}
            className="bg-white p-1 rounded shadow-md hover:bg-gray-100 transition-colors"
            title={minimapVisible ? "Hide minimap" : "Show minimap"}
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
                d={
                  minimapVisible
                    ? "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    : "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4"
                }
              />
            </svg>
          </button>
        </Panel>

        {/* Conditionally render MiniMap */}
        {minimapVisible && (
          <MiniMap
            nodeColor={() => "#3182ce"}
            maskColor="rgba(0, 0, 0, 0.1)"
            className="bg-white shadow-md rounded"
          />
        )}

        <Panel
          position="top-left"
          className="bg-white p-2 rounded shadow-md m-2 text-xs text-gray-500"
        >
          <div>
            <p>Drag services from the sidebar onto the canvas</p>
            <p className="mt-1">Hold Shift to select multiple nodes</p>
            <p className="mt-1">Hold Alt/Ctrl + click on edge to delete it</p>
          </div>
        </Panel>

        {/* Alignment toolbar */}
        {isAlignmentToolVisible && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex gap-2 z-50">
            <div className="border-r border-gray-200 pr-2 flex gap-1">
              <button
                className="p-1 hover:bg-gray-100 rounded"
                onClick={() => alignHorizontally("top")}
                title="Align tops"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-5 w-5"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path d="M15 1V3L1 3V1H15Z" fill="#000000"></path>{" "}
                    <path d="M13 5V15H9L9 5H13Z" fill="#000000"></path>{" "}
                    <path d="M7 11L7 5H3L3 11H7Z" fill="#000000"></path>{" "}
                  </g>
                </svg>
              </button>
              <button
                className="p-1 hover:bg-gray-100 rounded"
                onClick={() => alignHorizontally("center")}
                title="Align centers horizontally"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-5 w-5"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M16 7H13V1H9L9 15H13V9H16V7Z"
                      fill="#000000"
                    ></path>{" "}
                    <path d="M7 12H3V9H0V7H3V4L7 4L7 12Z" fill="#000000"></path>{" "}
                  </g>
                </svg>
              </button>
              <button
                className="p-1 hover:bg-gray-100 rounded"
                onClick={() => alignHorizontally("bottom")}
                title="Align bottoms"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-5 w-5"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path d="M13 11V1H9L9 11H13Z" fill="#000000"></path>{" "}
                    <path d="M15 15V13L1 13V15L15 15Z" fill="#000000"></path>{" "}
                    <path d="M7 5L7 11H3L3 5H7Z" fill="#000000"></path>{" "}
                  </g>
                </svg>
              </button>
            </div>

            <div className="border-r border-gray-200 pr-2 flex gap-1">
              <button
                className="p-1 hover:bg-gray-100 rounded"
                onClick={() => alignVertically("left")}
                title="Align left"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-5 w-5"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path d="M1 1H3V15H1V1Z" fill="#000000"></path>{" "}
                    <path d="M5 13H15V9H5V13Z" fill="#000000"></path>{" "}
                    <path d="M11 7H5V3H11V7Z" fill="#000000"></path>{" "}
                  </g>
                </svg>
              </button>
              <button
                className="p-1 hover:bg-gray-100 rounded"
                onClick={() => alignVertically("center")}
                title="Align centers vertically"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-5 w-5"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path d="M9 0H7V3H4V7H12V3H9V0Z" fill="#000000"></path>{" "}
                    <path d="M1 13V9H15V13H9V16H7V13H1Z" fill="#000000"></path>{" "}
                  </g>
                </svg>
              </button>
              <button
                className="p-1 hover:bg-gray-100 rounded"
                onClick={() => alignVertically("right")}
                title="Align right"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-5 w-5"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path d="M15 1H13V15H15V1Z" fill="#000000"></path>{" "}
                    <path d="M11 13H1V9H11V13Z" fill="#000000"></path>{" "}
                    <path d="M5 7H11V3H5V7Z" fill="#000000"></path>{" "}
                  </g>
                </svg>
              </button>
            </div>

            <div className="flex gap-1">
              <button
                className={`p-1 rounded ${
                  selectedNodes.length >= 3
                    ? "hover:bg-gray-100"
                    : "opacity-50 cursor-not-allowed"
                }`}
                onClick={distributeHorizontally}
                title="Distribute horizontally"
                disabled={selectedNodes.length < 3}
              >
                <svg
                  viewBox="0 0 24.00 24.00"
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#000000"
                  stroke="#000000"
                  stroke-width="0.72"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M2 10V3h1v7zm19 0h1V3h-1zm-5.354-.354l.707.707L20.207 6.5l-3.853-3.854-.707.707L18.293 6H5.707l2.647-2.646-.707-.707L3.793 6.5l3.854 3.854.707-.707L5.707 7h12.586zM13 13h9v9h-9zm1 8h7v-7h-7zM2 13h9v9H2zm1 8h7v-7H3z"></path>
                    <path fill="none" d="M0 0h24v24H0z"></path>
                  </g>
                </svg>
              </button>
              <button
                className={`p-1 rounded ${
                  selectedNodes.length >= 3
                    ? "hover:bg-gray-100"
                    : "opacity-50 cursor-not-allowed"
                }`}
                onClick={distributeVertically}
                title="Distribute vertically"
                disabled={selectedNodes.length < 3}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#000000"
                  stroke="#000000"
                  stroke-width="0.72"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M14 2h7v1h-7zm0 20h7v-1h-7zm5-15.293l1.646 1.646.707-.707L17.5 3.793l-3.854 3.853.707.707L17 5.707v12.586l-2.646-2.646-.707.707 3.853 3.853 3.854-3.854-.707-.707L18 18.293V5.707zM2 13h9v9H2zm1 8h7v-7H3zM2 2h9v9H2zm1 8h7V3H3z"></path>
                    <path fill="none" d="M0 0h24v24H0z"></path>
                  </g>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Trash bin */}
        {trashVisible && (
          <div
            id="trash-bin"
            className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 p-4 rounded-full ${
              isDraggingOverTrash
                ? "bg-red-500 text-white scale-125"
                : "bg-white text-red-500"
            } shadow-lg transition-all duration-200 flex items-center justify-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        )}
      </ReactFlow>
    </div>
  );
};

export default DiagramCanvas;
