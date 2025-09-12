import { useState } from 'react';
import { Package, Plus, History, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';

const NavLink = ({ href, label, active, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`nav-link ${active ? 'active' : ''}`}
    style={{ paddingLeft: 12 }}
  >
    {Icon && <Icon className="nav-icon" />}
    {label}
  </button>
);

const ToggleRow = ({ open, onClick, label, icon: Icon }) => (
  <button
    className="toggle-button"
    onClick={onClick}
  >
    <span className="toggle-content">
      {Icon && <Icon className="nav-icon" />}
      {label}
    </span>
    <span>
      {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
    </span>
  </button>
);

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [openEstoque, setOpenEstoque] = useState(true);

  return (
    <aside className="sidebar">
      <div className="brand">
        <span style={{ fontSize: 18 }}>FAZENDA</span>
        <span className="sub">estoque</span>
      </div>

      <nav className="nav">
        {/* Nível 0: ESTOQUE */}
        <ToggleRow 
          label="Estoque" 
          icon={Package}
          open={openEstoque} 
          onClick={() => setOpenEstoque(!openEstoque)} 
        />
        {openEstoque && (
          <div style={{ marginLeft: 10, display: 'grid', gap: 4 }}>
            <NavLink 
              label="Gerenciar Itens" 
              icon={Package}
              active={activeTab === 'estoque'} 
              onClick={() => setActiveTab('estoque')}
            />
            <NavLink 
              label="Movimentação" 
              icon={Plus}
              active={activeTab === 'movimentacao'} 
              onClick={() => setActiveTab('movimentacao')}
            />
            <NavLink 
              label="Histórico" 
              icon={History}
              active={activeTab === 'historico'} 
              onClick={() => setActiveTab('historico')}
            />
            <NavLink 
              label="Relatórios" 
              icon={BarChart3}
              active={activeTab === 'relatorios'} 
              onClick={() => setActiveTab('relatorios')}
            />
          </div>
        )}
      </nav>

      <div style={{ position: 'absolute', bottom: 18 }}>
        <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>
          Sistema de Controle
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

