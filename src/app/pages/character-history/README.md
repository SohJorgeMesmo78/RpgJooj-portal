# 📜 História do Personagem (Character History)

Esta página apresenta os contos e crônicas que formam o passado e os capítulos de jornada de um personagem.

## Rota Relativa
`/:name/historia` (Exemplo: `/kairo/historia`)

## Propósito
Permitir que o usuário leia a biografia do personagem de forma segmentada por capítulos, imitando um livro de histórias medieval.

## Estrutura Técnica
- **Componente**: `CharacterHistoryComponent`
- **Arquivos**:
  - [character-history.component.ts](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-history/character-history.component.ts)
  - [character-history.component.html](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-history/character-history.component.html)
  - [character-history.component.scss](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-history/character-history.component.scss)
  - `README.md` (Este arquivo)

## Integração com a API
- **Endpoint**: `GET /api/personagens/{id}` via `CharacterService.getCharacterById(charId)`
- **Dados consumidos**: Lista de capítulos (`chapters`) contendo título, descrição e ordem de exibição de cada relato.

## Regras de Negócio e Lógica Principal
- **Navegação por Capítulos**: Exibe um índice lateral ou superior com a numeração e títulos dos capítulos. Clicar em um capítulo atualiza o estado de `activeChapterIndex`.
- **Exibição do Capítulo Ativo**: Utiliza um getter do Angular (`activeChapter`) para renderizar dinamicamente o título e o texto completo do capítulo selecionado sem requisições adicionais.
- **Aparência de Livro Antigo**: O estilo SCSS customiza o layout em formato de folha de pergaminho amarelada/envelhecida com tipografia serifada clássica.
