import { useState } from 'react';
import Sidebar from './Sidebar.jsx';

const Layout = ({ children }) => {
  const [activeTab, setActiveTab] = useState('estoque');

  return (
    <div className="layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        <div className="header">
          <div style={{ fontWeight: 700 }}>Fazenda Estoque</div>
        </div>
        <div className="content">
          {typeof children === 'function' ? children({ activeTab, setActiveTab }) : children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

