// src/components/Sidebar.jsx
import { useState } from "react"
import { Package, Plus, History, BarChart3, ChevronDown, ChevronRight } from "lucide-react"

const Item = ({ active, onClick, icon: Icon, children }) => (
  <button
    onClick={onClick}
    className={[
      "w-full group flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
      active
        ? "bg-accent text-accent-foreground"
        : "hover:bg-muted hover:text-foreground text-muted-foreground"
    ].join(" ")}
  >
    {Icon && <Icon className="size-4 opacity-80 group-hover:opacity-100" />}
    <span className="truncate">{children}</span>
  </button>
)

export default function Sidebar({ activeTab, setActiveTab }) {
  const [openMov, setOpenMov] = useState(true)

  return (
    <aside className="h-dvh w-64 shrink-0 border-r bg-card text-card-foreground">
      <div className="p-4 border-b">
        <div className="text-lg font-semibold">Fazenda</div>
        <div className="text-xs text-muted-foreground">Estoque &amp; Movimentações</div>
      </div>

      <nav className="p-2 flex flex-col gap-1">
        <Item
          active={activeTab === "estoque"}
          onClick={() => setActiveTab("estoque")}
          icon={Package}
        >
          Itens de Estoque
        </Item>

        <button
          onClick={() => setOpenMov(!openMov)}
          className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <BarChart3 className="size-4" />
            Movimentações
          </span>
          {openMov ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>

        {openMov && (
          <div className="pl-2 flex flex-col gap-1">
            <Item
              active={activeTab === "mov-cadastrar"}
              onClick={() => setActiveTab("mov-cadastrar")}
              icon={Plus}
            >
              Registrar Movimentação
            </Item>
            <Item
              active={activeTab === "mov-listar"}
              onClick={() => setActiveTab("mov-listar")}
              icon={History}
            >
              Listar Movimentações
            </Item>
          </div>
        )}
      </nav>
    </aside>
  )
}
