# Fazenda Estoque - Sistema de Controle de Estoque

## Visão Geral

O **Fazenda Estoque** é uma aplicação de controle de estoque desenvolvida especificamente para integração com o **Ecosistema Rial**. A aplicação mantém a mesma identidade visual e sistema de autenticação do Rial, proporcionando uma experiência unificada para os usuários.

## Características Principais

### ✅ Funcionalidades Implementadas

- **Cadastro de Itens**: Registre itens com nome, descrição, unidade de medida e quantidade inicial
- **Controle de Estoque**: Visualize todos os itens cadastrados com status de estoque
- **Movimentação**: Registre entradas e saídas de estoque com data e observações
- **Histórico Completo**: Acompanhe todas as movimentações realizadas
- **Relatórios**: Dashboard com estatísticas básicas do estoque
- **Interface Responsiva**: Funciona em desktop e dispositivos móveis

### 🔗 Integração com Ecosistema Rial

- **Autenticação Compartilhada**: Usa o mesmo Firebase Auth do Rial
- **Design Consistente**: Mantém a identidade visual do ecosistema
- **Navegação Familiar**: Sidebar e layout idênticos ao sistema principal
- **Dados Seguros**: Armazenamento no Firestore com regras de segurança

## Tecnologias Utilizadas

- **Frontend**: React 18 + Vite
- **UI Components**: Tailwind CSS + shadcn/ui
- **Ícones**: Lucide React
- **Backend**: Firebase (Auth + Firestore)
- **Hospedagem**: Compatível com Vercel, Netlify, Firebase Hosting

## Estrutura do Projeto

```
fazenda-estoque/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes de UI (shadcn)
│   │   ├── AuthGate.jsx    # Proteção de autenticação
│   │   ├── LoginForm.jsx   # Formulário de login
│   │   ├── Layout.jsx      # Layout principal
│   │   ├── Sidebar.jsx     # Menu lateral
│   │   ├── EstoqueForm.jsx # Formulário de itens
│   │   ├── EstoqueList.jsx # Lista de itens
│   │   ├── MovimentacaoForm.jsx # Formulário de movimentação
│   │   └── MovimentacaoList.jsx # Lista de movimentações
│   ├── services/           # Serviços de integração
│   │   ├── firebaseConfig.js # Configuração Firebase
│   │   ├── authService.js    # Serviço de autenticação
│   │   └── estoqueService.js # Serviço de estoque
│   ├── App.jsx            # Componente principal
│   ├── App.css            # Estilos (inclui padrão Rial)
│   └── main.jsx           # Ponto de entrada
├── public/                # Arquivos públicos
├── integration-guide.md   # Guia de integração
└── README.md             # Esta documentação
```

## Como Usar

### Pré-requisitos

1. Node.js 18+ instalado
2. Acesso ao projeto Firebase do Ecosistema Rial
3. Credenciais de configuração do Firebase

### Instalação

1. **Clone ou extraia o projeto**:
   ```bash
   cd fazenda-estoque
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure o Firebase**:
   - Edite `src/services/firebaseConfig.js`
   - Substitua as configurações pelos dados reais do seu projeto Firebase

4. **Execute em desenvolvimento**:
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**:
   - Abra http://localhost:5173
   - Use as mesmas credenciais do Ecosistema Rial

### Deploy para Produção

1. **Build da aplicação**:
   ```bash
   npm run build
   ```

2. **Deploy** (escolha uma opção):
   - **Vercel**: Conecte o repositório e configure
   - **Netlify**: Faça upload da pasta `dist`
   - **Firebase Hosting**: Use `firebase deploy`
   - **Servidor próprio**: Copie a pasta `dist`

## Integração com Ecosistema Rial

### Opção 1: Aplicação Separada (Recomendado)

1. Faça deploy da aplicação em subdomínio (ex: `estoque.seudominio.com`)
2. Adicione link no menu do Ecosistema Rial principal
3. Usuários logados no Rial acessam automaticamente (SSO)

### Opção 2: Integração Direta

1. Copie os componentes para o projeto Rial existente
2. Adicione nova rota no sistema de navegação
3. Integre as opções no menu lateral

**Exemplo de integração no menu do Rial:**

```javascript
// No components/Sidebar.js do Ecosistema Rial
<ToggleRow label="Fazenda" icon={Package} open={openFazenda} onClick={() => setOpenFazenda(!openFazenda)} />
{openFazenda && (
  <div style={{ marginLeft: 10, display: 'grid', gap: 4 }}>
    <NavLink href="/fazenda/estoque" label="Controle de Estoque" active={pathname === '/fazenda/estoque'} />
  </div>
)}
```

## Estrutura de Dados

### Itens de Estoque
- **Nome**: Identificação do item
- **Descrição**: Detalhes adicionais
- **Unidade**: kg, litros, sacos, etc.
- **Quantidade**: Estoque atual
- **Usuário**: Vinculado ao usuário logado

### Movimentações
- **Tipo**: Entrada ou Saída
- **Quantidade**: Valor movimentado
- **Data**: Data da movimentação
- **Observações**: Detalhes adicionais
- **Usuário**: Vinculado ao usuário logado

## Segurança

- **Autenticação obrigatória**: Apenas usuários logados acessam
- **Isolamento de dados**: Cada usuário vê apenas seus dados
- **Regras Firestore**: Validação no banco de dados
- **Validação frontend**: Verificações antes do envio

## Funcionalidades Futuras

- **Alertas de estoque baixo**: Notificações automáticas
- **Relatórios avançados**: Gráficos e análises
- **Exportação de dados**: PDF e Excel
- **Códigos de barras**: Leitura e geração
- **Múltiplos locais**: Controle por fazenda/galpão
- **Integração com fornecedores**: API para pedidos automáticos

## Suporte

Para dúvidas sobre integração ou uso:

1. **Consulte o guia**: `integration-guide.md`
2. **Documentação Firebase**: https://firebase.google.com/docs
3. **Documentação React**: https://react.dev

## Licença

Este projeto foi desenvolvido especificamente para integração com o Ecosistema Rial. Todos os direitos reservados.

