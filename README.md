# Innova Coins

Painel para gerenciar turmas, professores, alunos, coins, histórico, chamada, calendário e pódio por nome de guerra.

## Supabase

O painel usa o Supabase para compartilhar turmas, alunos, pontuações, chamadas, calendário, prêmios e perfis entre computadores.

1. Crie um projeto no [Supabase](https://supabase.com/dashboard).
2. Abra **SQL Editor → New query**, copie todo o arquivo [`supabase/setup.sql`](./supabase/setup.sql) e execute. Ele configura o estado compartilhado e restringe leitura e gravação a funcionários autorizados. Ao atualizar uma instalação existente, preserva o banco compartilhado e remove os PINs antigos do estado.
3. Em **Authentication → Settings**, desative o cadastro público de usuários. Crie e confirme no Supabase Auth a conta institucional que será compartilhada pelos perfis. Uma única conta pode ser associada aos cinco perfis; cada perfil continua usando seu próprio PIN.
4. Associe essa conta a todos os perfis no SQL Editor. Troque o e-mail pelo endereço da conta:

   ```sql
   insert into public.innova_staff_profiles (user_id, profile_id)
   select users.id, profiles.profile_id
   from auth.users as users
   cross join (values ('admin'), ('matheus'), ('jheni'), ('lucas'), ('direcao')) as profiles(profile_id)
   where users.email = 'conta@escola.com'
   on conflict (profile_id)
   do update set user_id = excluded.user_id;
   ```

   No login, o PIN seleciona o perfil. Como todos os perfis usam a mesma conta técnica, as ações não identificam individualmente quem digitou o PIN; o nome exibido no histórico vem apenas do perfil selecionado.
5. Na Vercel, abra **Project → Settings → Environment Variables** e configure as variáveis abaixo para o ambiente **Production**. Os PINs e a chave Service Role devem permanecer somente no servidor:

   | Variável | Valor |
   | --- | --- |
   | `SUPABASE_URL` | URL do projeto Supabase |
   | `SUPABASE_ANON_KEY` | Chave Publishable (`sb_publishable_...`) ou anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Chave Secret/Service Role do Supabase; **somente na Vercel, nunca no navegador** |
   | `EMAIL_ADMIN` | E-mail da conta Auth associada ao perfil `admin` |
   | `EMAIL_MATHEUS` | E-mail da conta Auth associada ao perfil `matheus` |
   | `EMAIL_JHENI` | E-mail da conta Auth associada ao perfil `jheni` |
   | `EMAIL_LUCAS` | E-mail da conta Auth associada ao perfil `lucas` |
   | `EMAIL_DIRECAO` | E-mail da conta Auth associada ao perfil `direcao` |
   | `PIN_ADMIN` | PIN escolhido para Administrador |
   | `PIN_MATHEUS` | Novo PIN forte para Matheus |
   | `PIN_JHENI` | PIN escolhido para Jheni |
   | `PIN_LUCAS` | Novo PIN forte para Lucas |
   | `PIN_DIRECAO` | Novo PIN forte para Direção/Secretaria |

   Configure `EMAIL_ADMIN`, `EMAIL_MATHEUS`, `EMAIL_JHENI`, `EMAIL_LUCAS` e `EMAIL_DIRECAO` com o mesmo endereço institucional associado no SQL. Use PINs únicos, de preferência com 8 ou mais dígitos. Os PINs antigos foram removidos e não devem ser reutilizados. As funções da Vercel recebem os PINs pelo ambiente; eles não são gravados em `script.js` ou `config.js`. Não configure a chave Service Role em Preview ou Development se esses ambientes não forem confiáveis.
6. Publique/republique o site na Vercel. A tela pede perfil e PIN; o endpoint `api/pin-login.js` valida o PIN no servidor e cria uma sessão Supabase para o perfil associado. A leitura e a gravação continuam protegidas por RLS e pela associação em `innova_staff_profiles`.

As alterações dos outros computadores chegam pelo Supabase Realtime, com uma consulta periódica de segurança. Se duas pessoas salvarem ao mesmo tempo, uma delas será avisada para não sobrescrever silenciosamente a atualização mais recente.

Em uma instalação nova, o painel começa sem turmas; cadastre os dados depois de entrar com um perfil autorizado. Em uma instalação existente, execute o SQL de atualização para preservar o estado já armazenado no Supabase. Se os dados ainda existirem apenas no cache local antigo, entre com um perfil autorizado no mesmo navegador para importá-los para o Supabase.

### Acesso e dados

Os PINs ficam em variáveis privadas da Vercel, e não no JavaScript servido ao navegador. A função usa uma chave Service Role exclusivamente no servidor para trocar um PIN válido por uma sessão Supabase; a leitura da tabela exige uma sessão autenticada e uma associação em `innova_staff_profiles`, e gravações também verificam essa associação e a revisão do dado. Como qualquer segredo digitado no navegador pode ser observado pelo próprio usuário na aba **Network** do DevTools, PIN não é equivalente a uma senha invisível nem deve ser compartilhado com alunos. Para proteção adicional contra tentativas automatizadas, aplique rate limiting no Vercel Firewall; o limite em memória da função é apenas uma proteção complementar.

## Uso local

Para testar login local, use `vercel dev` com as variáveis configuradas; abrir `index.html` diretamente não fornece o endpoint serverless. Os dados só são carregados após a autenticação.

## Recursos

- Criar, editar e apagar turmas, alunos e professores.
- Nome oficial e nome de guerra exibido no pódio.
- Registrar coins positivos e negativos com data, motivo e histórico.
- Ranking de alunos e pódio geral de turmas.
- Chamada, calendários mensais independentes para Secretaria e Direção, calendários dos professores, exportação para PDF, prêmios e histórico.
- Login por PIN validado no servidor, sincronização compartilhada e controle de acesso pelo Supabase Auth/RLS.
