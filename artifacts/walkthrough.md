# Jornada de Onboarding Progressivo na EvoCommunity

O componente de onboarding ("Sua jornada na EVO") foi implementado e integrado à página principal do Feed, logo abaixo dos banners rotativos. Ele funciona como uma gamificação inicial para engajar novos membros, orientando-os nas ações fundamentais da comunidade.

## O que foi implementado

*   **🟢 `UserJourney.tsx`:** Criado um novo componente UI moderno e premium com:
    *   **Indicador de Progresso Horizontal:** Mostra visualmente a porcentagem de completude das cinco etapas requisitadas.
    *   **Validação Dinâmica e em Tempo Real:** 
        *   Perfil Completo: Valida os campos do banco local (`currentUser`).
        *   Conexão: Valida por array de conexões injetadas no app resgatadas do banco.
        *   Favoritos: Valida pelos favoritos do usuário de forma assíncrona/cache.
    *   **Validação por Queries Supabase:** As tabelas `posts` e `bottle_messages` são consultadas para verificar uso das funcionalidades (reflexões compartilhadas e envio de garrafa).
    *   **Ações (Botões):**
        *   Ao não ter perfil 100%, um botão de "Completar Perfil" redireciona para as configurações.
        *   Ao faltar conexões ou favoritos, orienta a ir para busca e "Explorar".
        *   Ao não ter enviado post, desce levemente na página até a caixa de texto de posts.
        *   Acionamento da Garrafa abre o `SendBottleModal` nativo, injetado dentro daquele próprio contexto para UX fluída.
    *   **Checkmarks de Concluído:** À medida que completadas, as ações ficam "riscadas", acesas em cor verde remetendo a "estado de sucesso".
    *   **Tela Final e Esconder Módulo:** Assim que todas as fatias são cumpridas, o card exibe uma mensagem comemorativa e um botão para "Continuar explorando a comunidade". Ao clicar, esse módulo some *para sempre* do feed daquela pessoa no browser (usando localStorage para suavizar a interface quando não mais necessário).

## UI/UX

O design foi concebido com os gradientes padrão da EVO (Azul/Roxo/Laranja), contendo micro-bordas para destaques sutis (`bg-gradient-to-r`). Ícones do próprio projeto de base foram reaproveitados para coesão visual (do arquivo `icons.tsx`). A implementação é responsiva para telas grandes e celulares.

## Como validar o componente na interface

1.  Abra a comunidade na página do Feed Home (logado num teste de usuário).
2.  Veja logo abaixo dos banners o novo container "Sua jornada na EVO".
3.  Tente "Completar Perfil" (irá para configurações). As etapas mudarão de estado conforme você as realizar.
4.  Certifique-se de que a Garrafa não saia da página e o Post não perca a rolagem nativa.

> [!NOTE] 
> O código foi construído com sucesso pelo `npm run build`, confirmando ausência de quebras de compilação ou missing imports referentes aos recursos de ícones e dependências globais.
