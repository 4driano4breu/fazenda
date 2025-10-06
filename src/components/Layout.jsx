// src/components/Layout.jsx
import { useState } from "react"
import Sidebar from "./Sidebar.jsx"

export default function Layout({ children }) {
  const [activeTab, setActiveTab] = useState("estoque")

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex max-w-screen-2xl">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="mx-auto max-w-screen-2xl px-6 py-4">
              <h1 className="text-base font-semibold">Fazenda Estoque</h1>
            </div>
          </header>
          <div className="mx-auto max-w-screen-2xl p-6">
            {typeof children === "function" ? children({ activeTab, setActiveTab }) : children}
          </div>
        </main>
      </div>
    </div>
  )
}
