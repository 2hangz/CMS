import React, { useState, useEffect } from 'react';

const BASE_API = 'https://entyre-backend.onrender.com/api/markdown';

const HomeContentSeeder = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [showPreview, setShowPreview] = useState(false);

  // Default home content structure
  const defaultHomeContent = [
    {
      sectionIndex: 0,
      title: "Welcome to ENTYRE",
      type: "text",
      content: `# Transforming End-of-Life Tyres into Valuable Resources

Welcome to the ENTYRE project platform - your comprehensive resource for exploring innovative End-of-Life Tyre (ELT) valorisation pathways in Ireland.

## About the Project

The ENTYRE project focuses on developing sustainable solutions for the approximately 55,000 tonnes of waste tyres generated annually in Ireland. Through cutting-edge research and innovative technologies, we're transforming waste into valuable resources while supporting Ireland's circular economy goals.

**Key Focus Areas:**
- Advanced recycling technologies
- Economic viability assessment  
- Environmental impact analysis
- Policy and regulatory frameworks
- Industry collaboration and implementation

Explore our interactive tools, research findings, and comprehensive pathway analysis to discover how End-of-Life Tyres can become a valuable resource rather than waste.`
    },
    {
      sectionIndex: 1,
      title: "Research Methodology & Approach",
      type: "text", 
      content: `## Our Research Approach

The ENTYRE project employs a comprehensive, multi-disciplinary methodology combining:

### Technical Analysis
- Life Cycle Assessment (LCA) of valorisation pathways
- Techno-economic feasibility studies
- Environmental impact evaluation
- Process optimization and efficiency analysis

### Stakeholder Engagement
- Industry consultation and collaboration
- Policy maker engagement
- Academic research partnerships
- Community impact assessment

### Innovation Framework
- Technology readiness level evaluation
- Market penetration strategies
- Scalability and implementation planning
- Regulatory compliance analysis

### Research Outputs
Our research generates actionable insights through peer-reviewed publications, technical reports, interactive tools, and policy recommendations that drive real-world implementation of sustainable ELT valorisation solutions.`
    },
    {
      sectionIndex: 2,
      title: "Key Statistics & Impact",
      type: "key-value",
      content: JSON.stringify({
        "Annual ELT Generation": "55,000 tonnes in Ireland",
        "Project Duration": "2022-2025", 
        "Research Team": "15+ Experts across multiple disciplines",
        "Valorisation Pathways": "7+ Innovative processing routes examined",
        "Industry Partners": "20+ Companies engaged in research",
        "Environmental Benefit": "Significant CO2 reduction potential",
        "Economic Impact": "Multi-million euro opportunity for Irish economy",
        "Publications": "15+ Peer-reviewed research papers",
        "Technology Readiness": "Pathways at TRL 4-8 development stages",
        "Policy Influence": "Direct input to national waste management strategy"
      }, null, 2)
    },
    {
      sectionIndex: 3,
      title: "Project Partners & Collaboration",
      type: "text",
      content: `## Project Consortium

### Lead Institution
**MaREI Centre, University College Cork**
- Leading sustainable energy research in Ireland
- Expertise in circular economy and waste valorisation
- State-of-the-art research facilities and equipment

### Research Partners
- **Industry Collaborators**: Major tyre manufacturers, waste management companies, and technology providers
- **Academic Partners**: International research institutions and universities
- **Government Agencies**: EPA Ireland, Department of Environment, Climate and Communications
- **EU Networks**: Horizon Europe partners and circular economy initiatives

### Funding & Support
This research is supported by Science Foundation Ireland, EU Horizon Europe programme, and industry co-funding, ensuring robust financial backing for comprehensive research outcomes.

### International Collaboration
ENTYRE maintains active collaboration with international research networks, ensuring our findings contribute to global best practices in End-of-Life Tyre management and circular economy implementation.

**Contact Information:**
For partnership opportunities, research collaboration, or general inquiries about the ENTYRE project, please contact our research team through the University College Cork MaREI Centre.`
    }
  ];

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const fetchExistingSections = async () => {
    try {
      const response = await fetch(BASE_API);
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
      showMessage('Failed to fetch existing sections', 'error');
    }
  };

  useEffect(() => {
    fetchExistingSections();
  }, []);

  const handleBulkSeed = async (clearExisting = false) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_API}/bulk-seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: defaultHomeContent,
          clearExisting
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        showMessage(
          `✅ Success! Created: ${result.created}, Updated: ${result.updated}${result.errors.length ? `, Errors: ${result.errors.length}` : ''}`,
          'success'
        );
        fetchExistingSections(); // Refresh the list
      } else {
        showMessage(`❌ Error: ${result.error}`, 'error');
      }
    } catch (error) {
      showMessage('❌ Failed to seed content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('⚠️ Are you sure you want to delete ALL existing home content? This cannot be undone!')) {
      return;
    }

    setLoading(true);
    try {
      // Delete all sections
      const promises = sections.map(section => 
        fetch(`${BASE_API}/${section._id}`, { method: 'DELETE' })
      );
      
      await Promise.all(promises);
      showMessage('🗑️ All home content cleared successfully', 'success');
      fetchExistingSections();
    } catch (error) {
      showMessage('❌ Failed to clear content', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div className="cms-card">
        <div className="cms-card-header">
          <h2 className="cms-card-title">Home Content Management</h2>
          <p style={{ margin: '8px 0 0 0', color: '#64748b' }}>
            Manage your homepage content sections with pre-defined project content
          </p>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`cms-message cms-message-${messageType}`} style={{ marginBottom: '24px' }}>
          {message}
        </div>
      )}

      {/* Current Status */}
      <div className="cms-card" style={{ marginBottom: '24px' }}>
        <div className="cms-card-header">
          <h3 className="cms-card-title">Current Status</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ 
            padding: '16px', 
            background: sections.length > 0 ? '#f0fdf4' : '#fef2f2', 
            borderRadius: '8px',
            border: `1px solid ${sections.length > 0 ? '#bbf7d0' : '#fecaca'}`
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              Existing Sections
            </div>
            <div style={{ fontSize: '1.5em', fontWeight: '700', color: sections.length > 0 ? '#166534' : '#dc2626' }}>
              {sections.length}
            </div>
          </div>
          
          <div style={{ 
            padding: '16px', 
            background: '#eff6ff', 
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              Default Sections Available
            </div>
            <div style={{ fontSize: '1.5em', fontWeight: '700', color: '#1d4ed8' }}>
              {defaultHomeContent.length}
            </div>
          </div>
        </div>

        {sections.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Current Sections:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {sections.map(section => (
                <span
                  key={section._id}
                  style={{
                    padding: '4px 8px',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '0.85em',
                    fontWeight: '500'
                  }}
                >
                  {section.sectionIndex}. {section.title || 'Untitled'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="cms-card" style={{ marginBottom: '24px' }}>
        <div className="cms-card-header">
          <h3 className="cms-card-title">Content Actions</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {/* Seed Default Content */}
          <div style={{ 
            padding: '20px', 
            border: '2px solid #e2e8f0', 
            borderRadius: '12px',
            background: '#f8fafc'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>
              🌱 Add Default Content
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.9em', color: '#64748b' }}>
              Add pre-written ENTYRE project content to your homepage. Existing sections with the same index will be updated.
            </p>
            <button
              className="cms-btn cms-btn-primary"
              onClick={() => handleBulkSeed(false)}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Adding...' : 'Add Default Content'}
            </button>
          </div>

          {/* Replace All Content */}
          <div style={{ 
            padding: '20px', 
            border: '2px solid #fbbf24', 
            borderRadius: '12px',
            background: '#fffbeb'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>
              🔄 Replace All Content
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.9em', color: '#92400e' }}>
              Clear all existing home content and replace with default ENTYRE content. This will delete current sections first.
            </p>
            <button
              className="cms-btn cms-btn-warning"
              onClick={() => handleBulkSeed(true)}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Replacing...' : 'Replace All Content'}
            </button>
          </div>

          {/* Clear All */}
          <div style={{ 
            padding: '20px', 
            border: '2px solid #ef4444', 
            borderRadius: '12px',
            background: '#fef2f2'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>
              🗑️ Clear All Content
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.9em', color: '#dc2626' }}>
              Remove all existing home content sections. Use this to start fresh or before manual content creation.
            </p>
            <button
              className="cms-btn cms-btn-danger"
              onClick={handleClearAll}
              disabled={loading || sections.length === 0}
              style={{ width: '100%' }}
            >
              {loading ? 'Clearing...' : 'Clear All Content'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="cms-card">
        <div className="cms-card-header">
          <h3 className="cms-card-title">Default Content Preview</h3>
          <button
            className="cms-btn cms-btn-secondary cms-btn-small"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
        
        {showPreview && (
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            background: '#fafafa'
          }}>
            {defaultHomeContent.map((section, idx) => (
              <div key={idx} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <span style={{ 
                    background: '#3b82f6', 
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.8em',
                    fontWeight: '600'
                  }}>
                    Section {section.sectionIndex}
                  </span>
                  <h4 style={{ margin: 0, color: '#1e293b' }}>
                    {section.title}
                  </h4>
                  <span style={{ 
                    background: section.type === 'text' ? '#dbeafe' : '#f0fdf4',
                    color: section.type === 'text' ? '#1e40af' : '#166534',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.75em',
                    fontWeight: '500'
                  }}>
                    {section.type}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '0.9em', 
                  color: '#4b5563',
                  fontFamily: 'monospace',
                  background: '#f9fafb',
                  padding: '12px',
                  borderRadius: '6px',
                  maxHeight: '120px',
                  overflow: 'hidden'
                }}>
                  {section.content.substring(0, 200)}
                  {section.content.length > 200 ? '...' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="cms-card" style={{ marginTop: '24px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#1e40af' }}>
          📋 Instructions
        </h4>
        <div style={{ fontSize: '0.95em', color: '#1e40af', lineHeight: '1.6' }}>
          <ol style={{ margin: '0', paddingLeft: '20px' }}>
            <li><strong>First Time Setup:</strong> Click "Add Default Content" to populate your homepage with ENTYRE project content</li>
            <li><strong>Reset Content:</strong> Use "Replace All Content" if you want to reset to default content</li>
            <li><strong>Edit Content:</strong> After seeding, go to the "Homepage Content" section in the CMS to edit individual sections</li>
            <li><strong>Custom Content:</strong> Use "Clear All Content" to start fresh and create your own sections manually</li>
            <li><strong>View Changes:</strong> Visit your homepage to see the content changes in real-time</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HomeContentSeeder;