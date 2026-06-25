import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Attributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface CharacterSheet {
  alignment: string;
  level: number;
  experience: number;
  hp: number;
  ac: number; // Armor Class
  attributes: Attributes;
  savingThrows: string[];
  skills: string[];
  vidaMaxima?: number;
  vidaAtual?: number;
}

export interface Chapter {
  id?: number;
  capitulo: number;
  tituloCapitulo?: string;
  texto: string;
}

export interface ClasseProgressoInfo {
  nivel: number;
  bonusProficiencia: number;
  truquesConhecidos: number;
  magiasConhecidas: number;
  espacosMagia: number;
  nivelMagia: number;
  invocacoesConhecidas: number;
}

export interface CaracteristicaClasseInfo {
  id: number;
  nivel: number;
  nome: string;
  descricao: string;
}

export interface ClasseInfo {
  nome: string;
  subclasse?: string;
  dadoVida: string;
  deslocamento: number;
  nivel: number;
  progresso?: ClasseProgressoInfo;
  caracteristicas?: CaracteristicaClasseInfo[];
}


export interface RacaInfo {
  nome: string;
  descricao: string;
  tipoCriatura: string;
  tamanho: string;
  deslocamento: number;
}

export interface TracoRacialInfo {
  id?: number;
  nome: string;
  descricao: string;
}

export interface PericiaInfo {
  id: number;
  nome: string;
  modificadorAtributo: string;
}

export interface PericiaCalculada {
  id: number;
  nome: string;
  modificadorAtributo: string;
  proficiente: boolean;
  maestria: boolean;
  origem?: string;
}

export interface AcaoInfo {
  id: number;
  nome: string;
  tipoAcao: string;
  alcance: string;
  bonusAcerto: string;
  dano: string;
  tipoDano: string;
  descricao?: string;
  acertoTooltip?: string;
  danoTooltip?: string;
}

export interface SalvaguardaInfo {
  atributo: string;
  modificador: number;
  isProficiente: boolean;
  valor: number;
}

export interface ProficienciaGeralInfo {
  id: number;
  tipo: string;
  nome: string;
  origem: string;
}

export interface MagiaInfo {
  id: number;
  nome: string;
  nivel: number;
  descricao: string;
}

export interface EquipamentoInfo {
  id: number;
  nome: string;
  descricao?: string;
  peso?: number;
  proficienciaRequerida?: string;
  tipoEquipamento: string; // Arma, Armadura, Escudo, Outro
  propriedades: string[];
  dano?: string;
  tipoDano?: string;
  modificadorClasseArmadura?: number;
  classeArmadura?: number;
  permiteDestreza?: boolean;
  forcaRequerida?: number;
  desvantagemFurtividade?: boolean;
  preco?: string;
}

export interface PersonagemEquipamentoInfo {
  id: number;
  idEquipamento: number;
  isEquipado: boolean;
  equipamento: EquipamentoInfo;
}

export interface Character {
  id: string;
  name: string;
  avatarUrl: string;
  
  // 3 Big Cards
  history: string;
  sheet: CharacterSheet;
  bonds: string[];
  
  // 2 Subcards
  race: string;
  classAndSubclass: string;
 
  // Chapters list from Database
  chapters?: Chapter[];
 
  // Classes detailed info
  classes?: ClasseInfo[];
 
  // Race detailed info
  racaInfo?: RacaInfo;
  tracosRaciais?: TracoRacialInfo[];
 
  // Pericias calculadas vindo da API
  pericias?: PericiaCalculada[];
  acoes?: AcaoInfo[];
  salvaguardas?: SalvaguardaInfo[];
  proficiencias?: ProficienciaGeralInfo[];
  idiomas?: string[];
  magias?: MagiaInfo[];
  equipamentos?: PersonagemEquipamentoInfo[];
  pecaCobre?: number;
  pecaPrata?: number;
  pecaElectro?: number;
  pecaOuro?: number;
  pecaPlatina?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private createEmptySheet(level: number, alignment?: string, attributes?: any): CharacterSheet {
    return {
      alignment: alignment || 'Não definido',
      level: level,
      experience: 0,
      hp: attributes?.vidaMaxima ?? 0,
      ac: 0,
      vidaMaxima: attributes?.vidaMaxima ?? 0,
      vidaAtual: attributes?.vidaAtual ?? 0,
      attributes: {
        strength: attributes?.forca ?? 0,
        dexterity: attributes?.destreza ?? 0,
        constitution: attributes?.constituicao ?? 0,
        intelligence: attributes?.inteligencia ?? 0,
        wisdom: attributes?.sabedoria ?? 0,
        charisma: attributes?.carisma ?? 0
      },
      savingThrows: [],
      skills: []
    };
  }

  getCharacters(): Observable<Character[]> {
    return this.http.get<any[]>(`${this.apiUrl}/personagens`).pipe(
      map(list => list.map(item => {
        const classStr = item.subclasse ? `${item.classe} / ${item.subclasse}` : item.classe;
        return {
          id: item.codigo,
          name: item.nome,
          avatarUrl: item.base64Imagem ? `data:image/png;base64,${item.base64Imagem}` : 'assets/images/placeholder.png',
          race: item.raca,
          classAndSubclass: classStr,
          history: '',
          sheet: this.createEmptySheet(item.nivel, item.alinhamento, item),
          bonds: []
        };
      })),
      catchError(() => of([]))
    );
  }

  getCharacterById(id: string): Observable<Character | undefined> {
    return this.http.get<any>(`${this.apiUrl}/personagens/${id}`).pipe(
      map(item => {
        if (!item) return undefined;
        
        const classStr = item.subclasse ? `${item.classe} / ${item.subclasse}` : item.classe;
        
        // Se houver histórico, o primeiro capítulo será retornado como história para visualização inicial no card
        const fullHistory = item.historias && item.historias.length > 0 
          ? item.historias[0].texto 
          : 'História em desenvolvimento. Em breve novos registros.';

        return {
          id: item.codigo,
          name: item.nome,
          avatarUrl: item.base64Imagem ? `data:image/png;base64,${item.base64Imagem}` : 'assets/images/placeholder.png',
          race: item.raca,
          classAndSubclass: classStr,
          history: fullHistory,
          sheet: this.createEmptySheet(item.nivel, item.alinhamento, item),
          bonds: [],
          chapters: item.historias || [],
          classes: item.classes || [],
          racaInfo: item.racaInfo,
          tracosRaciais: item.tracosRaciais || [],
          pericias: item.pericias || [],
          acoes: item.acoes || [],
          proficiencias: item.proficiencias || [],
          idiomas: item.idiomas || [],
          magias: item.magias || []
        };
      }),
      catchError(() => of(undefined))
    );
  }

  getPericias(): Observable<PericiaInfo[]> {
    return this.http.get<PericiaInfo[]>(`${this.apiUrl}/pericias`).pipe(
      catchError(() => of([]))
    );
  }

  getCharacterDetalhes(id: string): Observable<Character | undefined> {
    return this.http.get<any>(`${this.apiUrl}/personagens/detalhes?codigo=${id}`).pipe(
      map(item => {
        if (!item) return undefined;
        return {
          id: item.codigo,
          name: item.nome,
          avatarUrl: item.base64Imagem ? `data:image/png;base64,${item.base64Imagem}` : 'assets/images/placeholder.png',
          race: item.raca,
          classAndSubclass: item.classAndSubclass,
          history: item.history,
          sheet: this.createEmptySheet(item.nivel, item.alinhamento, item),
          bonds: []
        };
      }),
      catchError(() => of(undefined))
    );
  }

  getCharacterHistoria(id: string): Observable<Character | undefined> {
    return this.http.get<any>(`${this.apiUrl}/personagens/historia?codigo=${id}`).pipe(
      map(item => {
        if (!item) return undefined;
        const fullHistory = item.historias && item.historias.length > 0 
          ? item.historias[0].texto 
          : 'História em desenvolvimento. Em breve novos registros.';
        return {
          id: item.codigo,
          name: item.nome,
          avatarUrl: 'assets/images/placeholder.png',
          race: '',
          classAndSubclass: '',
          history: fullHistory,
          sheet: this.createEmptySheet(1, 'Não definido', {}),
          bonds: [],
          chapters: item.historias || []
        };
      }),
      catchError(() => of(undefined))
    );
  }

  getCharacterRaca(id: string): Observable<Character | undefined> {
    return this.http.get<any>(`${this.apiUrl}/personagens/raca?codigo=${id}`).pipe(
      map(item => {
        if (!item) return undefined;
        return {
          id: item.codigo,
          name: item.nome,
          avatarUrl: 'assets/images/placeholder.png',
          race: item.raca,
          classAndSubclass: '',
          history: '',
          sheet: this.createEmptySheet(1, 'Não definido', {}),
          bonds: [],
          racaInfo: item.racaInfo,
          tracosRaciais: item.tracosRaciais || []
        };
      }),
      catchError(() => of(undefined))
    );
  }

  getCharacterClasse(id: string): Observable<Character | undefined> {
    return this.http.get<any>(`${this.apiUrl}/personagens/classe?codigo=${id}`).pipe(
      map(item => {
        if (!item) return undefined;
        return {
          id: item.codigo,
          name: item.nome,
          avatarUrl: 'assets/images/placeholder.png',
          race: '',
          classAndSubclass: '',
          history: '',
          sheet: this.createEmptySheet(1, 'Não definido', {}),
          bonds: [],
          classes: item.classes || []
        };
      }),
      catchError(() => of(undefined))
    );
  }

  getCharacterFicha(id: string): Observable<Character | undefined> {
    return this.http.get<any>(`${this.apiUrl}/personagens/ficha?codigo=${id}`).pipe(
      map(item => {
        if (!item) return undefined;
        return {
          id: item.codigo,
          name: item.nome,
          avatarUrl: 'assets/images/placeholder.png',
          race: item.raca,
          classAndSubclass: item.classAndSubclass,
          history: '',
          sheet: this.createEmptySheet(item.nivel, item.alinhamento, item),
          bonds: [],
          classes: item.classes || [],
          racaInfo: item.racaInfo,
          tracosRaciais: item.tracosRaciais || [],
          pericias: item.pericias || [],
          acoes: item.acoes || [],
          proficiencias: item.proficiencias || [],
          idiomas: item.idiomas || [],
          magias: item.magias || [],
          equipamentos: item.equipamentos || [],
          pecaCobre: item.pecaCobre,
          pecaPrata: item.pecaPrata,
          pecaElectro: item.pecaElectro,
          pecaOuro: item.pecaOuro,
          pecaPlatina: item.pecaPlatina
        };
      }),
      catchError(() => of(undefined))
    );
  }

  equiparEquipamento(charCodigo: string, id: number, confirm: boolean = false): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/personagens/${charCodigo}/equipamentos/${id}/equipar?confirm=${confirm}`, {});
  }

  desequiparEquipamento(charCodigo: string, id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/personagens/${charCodigo}/equipamentos/${id}/desequipar`, {});
  }
}
