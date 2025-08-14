import React from "react";

function WorkflowList({ workflows, onEdit, onDelete }) {
  return (
    <div className="cms-card">
      <div className="cms-card-header">
        <h3 className="cms-card-title">Existing Workflows ({workflows.length})</h3>
      </div>
      
      {workflows.length === 0 ? (
        <div className="cms-empty-state">
          <div style={{ fontSize: '3em', marginBottom: '16px' }}>Workflow</div>
          <div>No workflows found. Create your first workflow to get started!</div>
        </div>
      ) : (
        <div className="cms-table-container">
          <table className="cms-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Description</th>
                <th>Components</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((wf) => (
                <tr key={wf._id || wf.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                      {wf.name || "(untitled)"}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8em',
                      fontWeight: '500',
                      background: wf.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                      color: wf.status === 'Active' ? '#166534' : '#475569'
                    }}>
                      {wf.status || "Draft"}
                    </span>
                  </td>
                  <td>
                    <div style={{ color: '#64748b', fontSize: '0.9em' }}>
                      {wf.description || "No description"}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85em', color: '#64748b' }}>
                      <div>{wf.nodes ? wf.nodes.length : 0} nodes</div>
                      <div>{wf.connections ? wf.connections.length : 0} connections</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85em', color: '#64748b' }}>
                      {wf.updatedAt ? new Date(wf.updatedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="cms-btn cms-btn-warning cms-btn-small"
                        onClick={() => onEdit(wf)}
                      >
                        Edit
                      </button>
                      <button 
                        className="cms-btn cms-btn-danger cms-btn-small"
                        onClick={() => onDelete(wf._id || wf.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default WorkflowList;