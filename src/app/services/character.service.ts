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

export interface ClasseInfo {
  nome: string;
  subclasse?: string;
  dadoVida: string;
  deslocamento: number;
  nivel: number;
}

export interface PericiaInfo {
  id: number;
  nome: string;
  modificadorAtributo: string;
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
          classes: item.classes || []
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
}
