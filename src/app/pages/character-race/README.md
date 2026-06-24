# 🧬 Informações de Raça (Character Race)

Esta página apresenta os detalhes biológicos, traços de lore e habilidades raciais específicas herdadas pela linhagem do personagem.

## Rota Relativa
`/:name/raca` (Exemplo: `/kairo/raca`)

## Propósito
Permitir ao usuário conhecer detalhadamente a herança racial do personagem (ex: Tiefling), incluindo tamanho, deslocamento, descrição histórica e fisiológica, além dos traços e habilidades raciais ativas.

## Estrutura Técnica
- **Componente**: `CharacterRaceComponent`
- **Arquivos**:
  - [character-race.component.ts](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-race/character-race.component.ts)
  - [character-race.component.html](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-race/character-race.component.html)
  - [character-race.component.scss](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-race/character-race.component.scss)
  - `README.md` (Este arquivo)

## Integração com a API
- **Endpoint**: `GET /api/personagens/{id}` via `CharacterService.getCharacterById(charId)`
- **Dados consumidos**: Informações dentro do objeto `racaInfo` (tipo de criatura, tamanho, deslocamento, descrição) e a lista de `tracosRaciais` (cada um contendo nome e descrição).

## Regras de Negócio e Lógica Principal
- **Alternância de Unidade de Deslocamento**: Clicar na estatística de Deslocamento executa a função `toggleSpeedUnit()` e atualiza a flag `exibirEmFeet`.
  - A exibição padrão é em metros (`9m`).
  - Em pés (`feet`), a conversão matemática realizada é: `Feet = Math.round((metros / 1.5) * 5)` (ex: `9m` vira `30 ft`).
- **Tratamento de Strings**: Para o tipo de criatura, o template utiliza o pipe `split` para formatar a string caso ela venha como namespace do banco de dados.
