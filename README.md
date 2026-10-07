# Innova Coins

Painel para gerenciar turmas, professores, alunos, coins, histórico, chamada, calendário e pódio por nome de guerra.

## Dados compartilhados pelo GitHub

O painel guarda os dados no arquivo `data/database.json` deste repositório. A função `api/database.js`, publicada pela Vercel, lê e atualiza o arquivo pela API do GitHub. Não é necessário configurar Firebase nem outro banco de dados.

Para configurar:

1. Importe este repositório como um projeto na Vercel e publique na branch `main`. A Vercel reconhece automaticamente a função em `api/database.js`.
2. Crie no GitHub um token fine-grained limitado ao repositório `InnovaCoins`, com a permissão **Contents: Read and write**.
3. No projeto da Vercel, abra **Settings → Environment Variables** e adicione `GITHUB_TOKEN` com o token. **Não adicione o token ao código ou ao repositório.**
4. `GITHUB_REPOSITORY` usa `JheniferFM/InnovaCoins` por padrão e `GITHUB_BRANCH` usa `main`. Configure essas variáveis somente se estiver usando outro repositório ou branch.
5. Faça um novo deploy depois de configurar as variáveis.

Na primeira entrada com perfil e PIN válidos, os dados locais daquele computador são copiados para o arquivo compartilhado, caso ele ainda esteja vazio. Depois que o JSON já tiver dados, ele se torna a fonte compartilhada para os demais computadores. As alterações são verificadas periodicamente; cada gravação cria um commit no GitHub e pode iniciar outro deploy da Vercel.

Se dois computadores tentarem gravar usando uma versão desatualizada, o painel avisa e atualiza os dados locais para evitar sobrescrever silenciosamente a versão mais recente. Refaça a alteração avisada após a atualização. O arquivo tem limite de 900 KB, incluindo fotos de prêmios.

Leituras do JSON são públicas. Para gravar, a API exige um perfil e PIN válidos e usa o token do GitHub apenas no servidor da Vercel. O PIN é uma proteção simples do painel, não substitui autenticação forte para dados confidenciais.

## Uso local

Abra `index.html` para experimentar a interface. Sem a função publicada pela Vercel, as alterações ficam somente no armazenamento local daquele navegador e não são compartilhadas.

## Recursos

- Criar, editar e apagar turmas, alunos e professores.
- Nome oficial e nome de guerra exibido no pódio.
- Registrar coins positivos e negativos com data, motivo e histórico.
- Ranking de alunos e pódio geral de turmas.
- Chamada, calendário, prêmios e histórico.
- Armazenamento local offline e sincronização compartilhada pelo arquivo JSON no GitHub.
