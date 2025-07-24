function Sidebar({ isOpen, toggle }) {
  const location = useLocation();
  const navigate = useNavigate(); // Add this hook
  const [expandedMenu, setExpandedMenu] = useState(null);

  const isActive = (path) => location.pathname.startsWith(path);

  // Modified click handler
  const handleLinkClick = (path) => {
    // Close sidebar after ensuring navigation
    setTimeout(toggle, 100);
    // Manually navigate to ensure it completes
    navigate(path);
  };

  // Menu items data remains the same...

  return (
    <>
      {/* Overlay remains the same... */}

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Close button remains the same... */}

        <nav aria-label="Main navigation">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.path}>
                <div className="menu-item-wrapper">
                  <Link
                    to={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(item.path);
                    }}
                    className={isActive(item.path) ? "active" : ""}
                  >
                    <i className={`fas ${item.icon}`} />
                    <span>{item.label}</span>
                  </Link>
                  
                  {/* Submenu toggle remains the same... */}
                </div>

                {/* Submenu items with updated click handler */}
                {item.submenu && expandedMenu === item.path && (
                  <ul className="submenu">
                    {item.submenu.map((subItem) => (
                      <li key={subItem.path}>
                        <Link
                          to={subItem.path}
                          onClick={(e) => {
                            e.preventDefault();
                            handleLinkClick(subItem.path);
                          }}
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}