import React, { useRef, useState } from "react";

const NODE_WIDTH = 120;
const NODE_HEIGHT = 40;

function WorkflowPreview({ nodes = [], connections = [], nodePositions = {}, onNodePositionChange, selectedNodeId, onNodeSelect }) {
  const canvasRef = useRef();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleNodeDrag = (nodeId, e) => {
    if (!onNodePositionChange) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom - NODE_WIDTH / 2;
    const y = (e.clientY - rect.top - pan.y) / zoom - NODE_HEIGHT / 2;

    onNodePositionChange(nodeId, { x: Math.round(x), y: Math.round(y) });
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Calculate connection paths
  const getConnectionPath = (conn) => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return '';

    const fromPos = nodePositions[conn.from] || { x: 0, y: 0 };
    const toPos = nodePositions[conn.to] || { x: 100, y: 100 };

    // Simple path for now
    return `M ${fromPos.x + NODE_WIDTH / 3} ${fromPos.y + NODE_HEIGHT / 2} L ${toPos.x + NODE_WIDTH / 3} ${toPos.y + NODE_HEIGHT / 2}`;
  };

  return (
    <div className="workflow-preview-panel">
      <div className="workflow-canvas-controls">
        <button onClick={resetView} className="cms-btn cms-btn-secondary cms-btn-small">
          Reset View
        </button>
        <div className="workflow-canvas-zoom">
          <button onClick={zoomOut}>−</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn}>+</button>
        </div>
      </div>
      
      <div 
        ref={canvasRef}
        className="workflow-preview-canvas"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* SVG for connections */}
        <svg 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            pointerEvents: 'none'
          }}
        >
          {connections.map((conn, idx) => (
            <path
              key={idx}
              d={getConnectionPath(conn)}
              className={`workflow-connection-line ${conn.edgeStyle || 'default'}`}
              markerEnd="url(#arrowhead)"
            />
          ))}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
             refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>

        {/* Nodes */}
        <div style={{ 
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}>
          {nodes.map((node) => {
            const pos = nodePositions[node.id] || { x: 0, y: 0 };
            return (
              <div
                key={node.id}
                className={`workflow-node ${selectedNodeId === node.id ? 'workflow-node-selected' : ''}`}
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: NODE_WIDTH,
                  height: NODE_HEIGHT,
                  cursor: 'move',
                  position: 'absolute',
                  transformOrigin: 'center center'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onNodeSelect?.(node.id);

                  const handleMouseMove = (moveE) => {
                    handleNodeDrag(node.id, {
                      clientX: moveE.clientX,
                      clientY: moveE.clientY
                    });
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                {node.icon && (
                  <img src={node.icon} alt="" className="workflow-node-icon" />
                )}
                <div style={{ fontWeight: '600', fontSize: '0.85em' }}>
                  {node.label || node.id}
                </div>
                {node.detail && (
                  <div style={{ fontSize: '0.75em', color: '#64748b', marginTop: '2px' }}>
                    {node.detail.length > 20 ? node.detail.substring(0, 20) + '...' : node.detail}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div style={{ marginTop: '12px', fontSize: '0.85em', color: '#64748b', textAlign: 'center' }}>
        Drag nodes to reposition • Click to select • Scroll to zoom
      </div>
    </div>
  );
}

export default WorkflowPreview;