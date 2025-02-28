import React, { useState } from 'react';


const Menu = ({ setSelectedMenu, selectedMenu }) => {
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  return (
    <div className="menu-container">
      <div className="list-group">
        {/* Academic Menu */}
        <button
          className="list-group-item list-group-item-secondary"
          onClick={() => toggleMenu('academic')}
        >
          Academic {expandedMenu === 'academic' ? '▼' : '▶'}
        </button>
        {expandedMenu === 'academic' && (
          <>
            <button
              className={`list-group-item list-group-item-action ${selectedMenu === 'course' ? 'active' : ''}`}
              onClick={() => setSelectedMenu('course')}
            >
              Course Wise
            </button>
            <button
              className={`list-group-item list-group-item-action ${selectedMenu === 'skills' ? 'active' : ''}`}
              onClick={() => setSelectedMenu('skills')}
            >
              Skills Wise
            </button>
          </>
        )}

        {/* Organization Menu */}
        <button
          className="list-group-item list-group-item-secondary"
          onClick={() => toggleMenu('organization')}
        >
          Organization {expandedMenu === 'organization' ? '▼' : '▶'}
        </button>
        {expandedMenu === 'organization' && (
          <button
            className={`list-group-item list-group-item-action ${selectedMenu === 'industry' ? 'active' : ''}`}
            onClick={() => setSelectedMenu('industry')}
          >
            Industry
          </button>
        )}
      </div>
    </div>
  );
};

export default Menu;
