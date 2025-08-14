import React from "react";

function NodeListTable({ nodes, onSelect, selectedNodeId, page, setPage, pageSize = 20 }) {
  const totalPages = Math.ceil(nodes.length / pageSize);

  const pagedNodes = nodes.slice((page - 1) * pageSize, page * pageSize);

  const handlePageChange = (newPage, e) => {
    if (e) e.preventDefault();
    setPage(newPage);
  };

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, background: '#f8fafc', marginTop: 16 }}>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>All Nodes (Page {page}/{totalPages || 1})</div>
      <table className="cms-table" style={{ fontSize: '0.95em' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>Label</th>
            <th>Type</th>
            <th>Selectable</th>
            <th>Detail</th>
            <th>Icon</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pagedNodes.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', color: '#64748b' }}>No nodes</td>
            </tr>
          ) : (
            pagedNodes.map((node, idx) => (
              <tr key={node.id} style={selectedNodeId === node.id ? { background: '#e0f2fe' } : {}}>
                <td>{(page - 1) * pageSize + idx + 1}</td>
                <td>
                  <span
                    style={{
                      fontWeight: selectedNodeId === node.id ? 700 : 500,
                      color: selectedNodeId === node.id ? '#2563eb' : '#1e293b',
                      cursor: 'pointer'
                    }}
                    onClick={() => onSelect(node.id)}
                  >
                    {node.id}
                  </span>
                </td>
                <td>{node.label}</td>
                <td>{node.type}</td>
                <td>{node.selectable ? "Yes" : "No"}</td>
                <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {node.detail}
                </td>
                <td>
                  {node.icon && <img src={node.icon} alt="" style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #e2e8f0' }} />}
                </td>
                <td>
                  <button
                    className="cms-btn cms-btn-secondary cms-btn-small"
                    type="button"
                    onClick={() => onSelect(node.id)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 8, gap: 8 }}>
        <button
          className="cms-btn cms-btn-small"
          type="button"
          disabled={page <= 1}
          onClick={e => handlePageChange(page - 1, e)}
        >Prev</button>
        <span>Page {page} / {totalPages || 1}</span>
        <button
          className="cms-btn cms-btn-small"
          type="button"
          disabled={page >= totalPages}
          onClick={e => handlePageChange(page + 1, e)}
        >Next</button>
      </div>
    </div>
  );
}

export default NodeListTable;