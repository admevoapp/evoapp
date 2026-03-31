# Objetivo

Criar um componente de onboarding progressivo ("Sua jornada na EvoCommunity") exibido no topo do Feed (abaixo dos banners rotativos), para incentivar novos usuários a completarem o perfil e interagirem na comunidade.

## Mudanças Propostas

### 1. Criar `components/UserJourney.tsx` [NOVO]

- O componente aceitará props: `currentUser`, `onNavigate` e `onClose` (ou gerenciará um estado interno de fechamento quando concluído).
- Fará a checagem das 5 etapas:
  1. **Complete seu perfil**: Checar dados no `currentUser` (nome, profissão, helpArea, behavioralProfile e location). Ação: navegar para `settings` (onde o perfil é editado).
  2. **Conecte-se com alguém**: Checar `currentUser.connections?.length > 0`. Ação: navegar para `connections` ou `search`.
  3. **Escolha quem quer acompanhar**: Checar `currentUser.favorites?.length > 0`. Ação: navegar para `search` (Pessoas) ou orientar no Feed.
  4. **Compartilhe sua primeira reflexão**: Fazer query supabase na tabela `posts` para checar `user_id = currentUser.id`. Ação: scroll manual ou focar na área de postagem, ou `onNavigate('feed')`.
  5. **Envie uma mensagem na garrafa**: Fazer query supabase na tabela `bottle_messages` para checar `sender_id = currentUser.id`. Ação: Gerenciar o modal `SendBottleModal` para abrir internamente.
- Exibir Barra de progresso proporcional e a quantidade (ex: 2 de 5).
- Se todos estiverem completos, alterar a visualização para a mensagem de "Parabéns" com botão "Continuar explorando a comunidade" que ocultará o painel.
- Usar design premium: bordas arredondadas, cores EVO, micro-animações, layout progressivo e responsivo.

### 2. Modificar `components/Feed.tsx` [MODIFICAR]

- Importar o novo componente `UserJourney`.
- Inserir logo abaixo do componente `BannerSlider` e antes dos campos de criação de post / destaques admin.

## Perguntas em Aberto

Nenhuma dúvida crítica. O modal de garrafa será reutilizado do `SendBottleModal`. O fluxo de navegação usará `onNavigate('settings')`, etc. Após a aprovação do plano, implementarei os componentes.
