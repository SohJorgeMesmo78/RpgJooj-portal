# 🛡️ Detalhes do Personagem (Character Detail)

Esta página apresenta as informações consolidadas e o menu principal de navegação para um personagem específico do RPGJooj.

## Rota Relativa
`/:name` (Exemplo: `/kairo`)

## Propósito
Exibir o panorama geral do personagem, incluindo imagem, nome completo, classe, nível, atributos principais e seus respectivos modificadores. Serve como o hub principal para acessar as outras sub-telas do personagem (Ficha, História, Laços, Raça e Classe).

## Estrutura Técnica
- **Componente**: `CharacterDetailComponent`
- **Arquivos**:
  - [character-detail.component.ts](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-detail/character-detail.component.ts)
  - [character-detail.component.html](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-detail/character-detail.component.html)
  - [character-detail.component.scss](file:///d:/HD/Projetos/RpgJooj/RpgJooj-portal/src/app/pages/character-detail/character-detail.component.scss)
  - `README.md` (Este arquivo)

## Integração com a API
- **Endpoint**: `GET /api/personagens/{id}` via `CharacterService.getCharacterById(charId)`
- **Dados consumidos**: Objeto `Character` completo, contendo imagem do personagem, atributos (Força, Destreza, Constituição, Inteligência, Sabedoria, Carisma), classe, nível e raça.

## Regras de Negócio e Lógica Principal
- **Cálculo da Classe de Armadura (CA)**: A Classe de Armadura é calculada em tempo de execução no frontend: `CA = 10 + Modificador de Destreza`.
- **Cálculo dos Modificadores**: Utiliza a função `getModifier(valorAtributo)` para calcular o modificador clássico do D&D 5e: `Mod = Math.floor((Atributo - 10) / 2)`. Retorna o valor formatado com sinal positivo/negativo (ex: `+3` ou `-1`).
- **Navegação do Grimório**: Apresenta botões estilizados em formato medieval para transição direta para a Ficha, História, Laços, Raça e Classe do personagem.
