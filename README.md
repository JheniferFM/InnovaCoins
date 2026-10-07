# Innova Coins - Sistema de Gamificação por Turma

## 🚀 Setup Firebase para Vercel

### 1. Criar Projeto Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Criar Projeto"
3. Nomeie como "innova-coins"
4. Prossiga com as configurações padrão

### 2. Obter Credenciais
1. No Firebase Console, vá para **Configurações do Projeto**
2. Na aba **Seu aplicativo**, clique em **Web** (</>)
3. Copie o objeto de configuração
4. Cole em `config.js`

### 3. Habilitar Firestore
1. No Firebase, vá para **Firestore Database**
2. Clique em **Criar banco de dados**
3. Inicie em modo **Teste** (depois configure segurança)
4. Escolha a localização mais próxima

### 4. Regras de Segurança do Firestore
Cole isto em **Regras do Firestore**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita em produção com autenticação
    match /turmas/{turmaId} {
      allow read, write: if true; // Mude para autenticação em produção
    }
    match /alunos/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 5. Publicar no Vercel
```bash
npm init -y
npm install
git push  # Push para GitHub
```

No Vercel:
1. Conecte seu repositório GitHub
2. Deploy automático!

## 📊 Estrutura do Banco de Dados

### Coleção: `turmas`
```javascript
{
  id: "turma-uuid",
  nome: "Discovery 14h",
  nomeDeGuerra: "Dragons", // Nome escolhido pela turma
  dia: "Terça-feira",
  horario: "14h",
  professores: ["Matheus", "João"],
  totalCoins: 1250,
  criadoEm: timestamp,
  atualizadoEm: timestamp
}
```

### Coleção: `alunos`
```javascript
{
  id: "aluno-uuid",
  turmaId: "turma-uuid",
  nome: "João Silva",
  coins: 150,
  historico: [
    { tipo: "bonus", valor: 10, motivo: "Ajudou colega", data: timestamp },
    { tipo: "penalidade", valor: -5, motivo: "Falta", data: timestamp }
  ],
  criadoEm: timestamp,
  atualizadoEm: timestamp
}
```

## 🎮 Funcionalidades

✅ Criar turmas com nome de guerra  
✅ Editar informações da turma  
✅ Deletar turmas  
✅ Adicionar/remover alunos  
✅ Registrar pontos (coins) por aluno  
✅ Pódio por turma  
✅ Histórico de transações  
✅ Persistência offline com Firebase  

## 🛠️ Desenvolvimento Local

```bash
# Instalar extensão Firebase para VS Code
# Ou servir localmente
npx http-server
```

## 📱 Responsividade
Otimizado para desktop e tablet. Funciona perfeitamente no Vercel!
 # Innova Coins
 
 Painel para gerenciar várias turmas, professores, alunos, coins, histórico e pódio por nome de guerra.
 
 ## Uso local
 
 Abra `index.html` ou sirva a pasta com qualquer servidor estático. Sem credenciais do Firebase, os dados ficam salvos no `localStorage` deste navegador, o que permite testar toda a interface.
 
 ## Banco compartilhado para a Vercel
 
 Para que vários professores vejam os mesmos dados:
 
 1. Crie um projeto no [Firebase Console](https://console.firebase.google.com).
 2. Ative o Firestore Database.
 3. Cadastre um aplicativo Web e copie as credenciais para `config.js`.
4. Ative o Storage para armazenar as fotos dos prêmios.
5. Configure as regras do Firestore e Storage para o modo sem login.
6. Publique esta pasta na Vercel como projeto estático.
 
 Com as credenciais corretas em `config.js`, os dados compartilhados são mantidos no documento `innova/database` do Firestore e atualizados em tempo real nos computadores conectados. A lista de perfis também é acompanhada em tempo real. Sem Firestore, o painel funciona apenas com os dados locais daquele navegador; alterações locais não são compartilhadas com outros computadores.

O painel usa entrada por PIN, sem e-mail ou senha. Os perfis disponíveis são Administrador, Matheus, Jheni, Lucas e Direção. O PIN é solicitado apenas ao entrar ou trocar de perfil; depois disso, o responsável é registrado automaticamente em cada lançamento junto com data, hora, motivo e alteração.

Exemplo mínimo para o painel sem login (use App Check ou um backend se precisar proteger contra escrita externa):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /innova/database {
      allow read, write: if true;
    }
  }
}
```

Para o Storage, durante o desenvolvimento:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /awards/{fileName} {
      allow read, write: if true;
    }
  }
}
```
 
 ## Recursos
 
 - Criar, editar e apagar turmas.
 - Vários professores na mesma turma.
 - Nome oficial e nome de guerra exibido no pódio.
 - Criar, editar e apagar alunos.
 - Registrar coins positivos e negativos com data, motivo e histórico.
 - Ranking de alunos e pódio geral de turmas.
 - Persistência local para uso sem conexão e sincronização em tempo real entre computadores pelo Firestore.
