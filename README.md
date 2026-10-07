# Innova Coins

Painel para gerenciar turmas, professores, alunos, coins, histórico, chamada, calendário e pódio por nome de guerra.

## Supabase

O painel usa o Supabase para compartilhar turmas, alunos, pontuações, chamadas, calendário, prêmios e perfis entre computadores.

1. Crie um projeto no [Supabase](https://supabase.com/dashboard).
2. Abra **SQL Editor → New query**, copie todo o arquivo [`supabase/setup.sql`](./supabase/setup.sql) e execute. Ele cria a tabela e as regras de leitura/escrita, inicializa os perfis padrão sem apagar dados que já existam e habilita o canal de atualizações em tempo real.
3. A URL e a chave **Publishable** (`sb_publishable_...`) estão configuradas em `config.js`. Essa chave foi feita para ser pública e pode ficar no código. **Nunca use nem publique uma chave Secret.**
4. Publique o repositório na Vercel. Como as credenciais públicas estão no `config.js`, não é necessário configurar variáveis de ambiente da Vercel.
5. Abra o painel. Se a tabela estiver vazia, entre com um perfil válido para inicializar os dados locais desse computador. Quando já houver dados compartilhados, esses dados são carregados do Supabase.

As alterações dos outros computadores chegam pelo Supabase Realtime, com uma consulta periódica de segurança. Se duas pessoas salvarem ao mesmo tempo, uma delas será avisada para não sobrescrever silenciosamente a atualização mais recente.

### Segurança dos perfis por PIN

O painel mantém a entrada por perfil e PIN já existente. Como esses perfis não são contas autenticadas pelo Supabase, os dados compartilhados e os PINs da aplicação não devem ser considerados privados ou seguros contra alguém que inspecione o site. A tabela permite leitura pública, mas não permite escrita direta: gravações passam pela função `save_innova_state`, que valida o PIN e a revisão do dado. Para informações confidenciais, a aplicação precisa migrar para contas individuais do Supabase Auth.

## Uso local

Abra `index.html` para experimentar a interface. Para compartilhar e sincronizar dados, use a versão publicada na Vercel e execute o SQL de configuração do Supabase.

## Recursos

- Criar, editar e apagar turmas, alunos e professores.
- Nome oficial e nome de guerra exibido no pódio.
- Registrar coins positivos e negativos com data, motivo e histórico.
- Ranking de alunos e pódio geral de turmas.
- Chamada, calendário, prêmios e histórico.
- Armazenamento local offline e sincronização compartilhada pelo Supabase.
