# 🔗 Laços e Intriga (Character Bonds)

Esta página é uma seção em construção (Work In Progress) planejada para rastrear as relações sociais do personagem.

## Rota Relativa
`/:name/lacos` (Exemplo: `/kairo/lacos`)

## Propósito
Apresentar as relações, contatos, alianças, rivais e segredos do personagem. Atualmente, exibe uma tela com um banner informativo e indicador visual "WIP" no tema dark medieval.

## Estrutura Técnica
- **Componente**: `CharacterBondsComponent`
- **Arquivos**:
  - [character-bonds.component.ts](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-bonds/character-bonds.component.ts)
  - [character-bonds.component.html](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-bonds/character-bonds.component.html)
  - [character-bonds.component.scss](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-bonds/character-bonds.component.scss)
  - `README.md` (Este arquivo)

## Integração com a API
- **Endpoint**: Nenhum endpoint ativo no momento (página de template estático / WIP).

## Regras de Negócio e Lógica Principal
- **Navegação de Retorno**: Utiliza o parâmetro `:name` capturado da rota pelo `ActivatedRoute` para compor o link de retorno dinâmico para a página de Detalhes do Personagem.
- **Design de Transição**: Utiliza animações CSS customizadas (`animate-fade-in`) e estilização medieval consistente com o design grimoire geral para indicar que a feature está em desenvolvimento futuro.
