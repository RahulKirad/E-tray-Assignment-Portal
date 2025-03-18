import React, { useState } from 'react';
import "./menu.css";

const Menu = ({ setSelectedMenu, selectedMenu }) => {
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [expandedSubMenu, setExpandedSubMenu] = useState(null);

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
    setExpandedSubMenu(null); // Reset sub-menu when switching main menu
  };

  const toggleSubMenu = (subMenu) => {
    setExpandedSubMenu(expandedSubMenu === subMenu ? null : subMenu);
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
            {/* School Option */}
            <button
              className={`list-group-item list-group-item-action ${selectedMenu === 'school' ? 'active' : ''}`}
              onClick={() => setSelectedMenu('school')}
            >
              School Portal 
            </button>

            {/* College Menu */}
            <button
              className="list-group-item list-group-item-secondary"
              onClick={() => toggleSubMenu('college')}
            >
              College Portal {expandedSubMenu === 'college' ? '▼' : '▶'}
            </button>
            {expandedSubMenu === 'college' && (
              <>
                <button
                  className={`list-group-item list-group-item-action ms-3 ${selectedMenu === 'course' ? 'active' : ''}`}
                  onClick={() => setSelectedMenu('course')}
                >
                  Course Wise
                </button>
                <button
                  className={`list-group-item list-group-item-action ms-3 ${selectedMenu === 'skills' ? 'active' : ''}`}
                  onClick={() => setSelectedMenu('skills')}
                >
                  Skills Wise
                </button>
              </>
            )}
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
            Industry Portal
          </button>
        )}
      </div>
    </div>
  );
};

export default Menu;
