# ⚔️ Informações de Classe (Character Class)

Esta página detalha a progressão de nível, recursos de conjuração (se houver), dado de vida e a lista cronológica de características de classe desbloqueadas pelo personagem.

## Rota Relativa
`/:name/classe` (Exemplo: `/kairo/classe`)

## Propósito
Apresentar a ficha de treinamento do personagem. Permite acompanhar as estatísticas do nível atual (como espaços de magia e bônus de proficiência) e visualizar a linha do tempo de habilidades e características de classe adquiridas a cada nível.

## Estrutura Técnica
- **Componente**: `CharacterClassComponent`
- **Arquivos**:
  - [character-class.component.ts](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-class/character-class.component.ts)
  - [character-class.component.html](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-class/character-class.component.html)
  - [character-class.component.scss](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-class/character-class.component.scss)
  - `README.md` (Este arquivo)

## Integração com a API
- **Endpoint**: `GET /api/personagens/{id}` via `CharacterService.getCharacterById(charId)`
- **Dados consumidos**: Lista de classes (`classes`) no objeto do personagem, cada uma contendo: dado de vida (`dadoVida`), subclass (`subclasse`), progresso de nível (`progresso`) e a coleção de características (`caracteristicas`).

## Regras de Negócio e Lógica Principal
- **Timeline de Características**: As habilidades adquiridas são listadas em ordem em uma linha do tempo (timeline) vertical construída em CSS, identificando o nível de aquisição de cada uma.
- **Formatação de Nível de Magia**: O helper `formatMagicLevel(nivel)` formata o nível dos espaços de magia para a notação ordinal em português (ex: `1` vira `1º`, e `0` vira `—`).
- **Resumo de Progresso**: Apresenta cards contendo:
  - Bônus de Proficiência
  - Truques Conhecidos
  - Magias Conhecidas
  - Espaços de Magia
  - Nível de Magia
  - Invocações Místicas Conhecidas
