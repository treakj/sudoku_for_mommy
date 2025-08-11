# 🔥 Guia Completo: Firebase Setup - Sudoku for Mommy

## 📋 Pré-requisitos

1. **Conta Google**: Você precisa de uma conta Google ativa
2. **Node.js**: Instalar a versão mais recente do [Node.js](https://nodejs.org/)
3. **Git**: Para controle de versão (opcional, mas recomendado)

## 🚀 Passo a Passo para Configurar Firebase

### Método 1: Usando Console Web (Recomendado)

#### 1. Criar Projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"** ou **"Create a project"**
3. Nome do projeto: `sudoku-for-mom` (ou outro nome de sua escolha)
4. **Desabilite** Google Analytics (não é necessário para este projeto)
5. Clique em **"Criar projeto"**

#### 2. Configurar Hosting

1. No painel do projeto, clique em **"Hosting"** no menu lateral
2. Clique em **"Começar"** ou **"Get started"**
3. Siga as instruções para instalar Firebase CLI (se ainda não fez)

#### 3. Instalar Firebase CLI

Abra o PowerShell como **Administrador** e execute:

### 6. Comandos Úteis

```bash
# Ver projetos
firebase projects:list

# Ver sites de hosting
firebase hosting:sites:list

# Ver logs de deploy
firebase deploy --debug

# Deploy apenas hosting
firebase deploy --only hosting

# Visualizar antes do deploy
firebase hosting:channel:deploy preview

# Configurar domínio customizado
firebase hosting:sites:get YOUR_SITE_ID
```powershell
npm install -g firebase-tools
```

Verifique a instalação:
```powershell
firebase --version
```

#### 4. Login no Firebase

```powershell
firebase login
```

Isso abrirá seu navegador para fazer login com sua conta Google.

#### 5. Inicializar Projeto Local

Na pasta do seu projeto (`c:\Users\treak\Code\sudoku_for_mommy`):

```powershell
cd "c:\Users\treak\Code\sudoku_for_mommy"
firebase init hosting
```

**Configurações importantes:**
- Quando perguntado sobre o projeto, selecione o projeto que você criou no console
- Public directory: `public` ✅
- Configure as single-page app: `Yes` ✅ 
- Set up automatic builds: `No` ❌
- Overwrite index.html: `No` ❌ (IMPORTANTE!)

#### 6. Deploy

```powershell
firebase deploy
```

### 🔧 Resolução de Problemas Comuns

#### Erro: "Failed to create project"

**Possíveis causas e soluções:**

1. **Quota de projetos excedida**:
   - Cada conta Google tem limite de projetos
   - Solução: Delete projetos antigos ou use outro email

2. **Nome do projeto já existe**:
   - Tente nomes diferentes: `sudoku-for-mom-2024`, `sudoku-game-mom`, etc.

3. **Problemas de permissão**:
   - Execute PowerShell como **Administrador**
   - Verifique se está logado: `firebase auth:list`

4. **Conexão de rede**:
   - Verifique sua conexão
   - Tente novamente após alguns minutos

#### Comandos Úteis para Diagnóstico

```powershell
# Verificar login
firebase auth:list

# Verificar projetos existentes
firebase projects:list

# Logout e login novamente
firebase logout
firebase login

# Verificar versão
firebase --version

# Ver logs detalhados
firebase --debug
```

### 🎯 Configuração Manual

Se tudo mais falhar, você pode configurar manualmente:

1. Crie o arquivo `.firebaserc` na raiz do projeto:

```json
{
  "projects": {
    "default": "SEU-PROJECT-ID-AQUI"
  }
}
```

2. Substitua `SEU-PROJECT-ID-AQUI` pelo ID do projeto criado no console web.

### ✅ Checklist Final

- [ ] Projeto criado no Firebase Console
- [ ] Firebase CLI instalado
- [ ] Login realizado com sucesso
- [ ] Projeto inicializado com hosting
- [ ] Deploy realizado com sucesso
- [ ] Site acessível via URL fornecida

---

## 🎮 Pronto para Jogar!

Após seguir estes passos, seu jogo de Sudoku estará disponível online para todos jogarem!
