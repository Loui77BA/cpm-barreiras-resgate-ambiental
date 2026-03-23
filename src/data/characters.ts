import { CharacterName } from '../constants';

export interface CharacterData {
  name: CharacterName;
  imageKey: string;
  description: string;
  color: number;
  victoryPhrase: string;
}

export const CHARACTERS: CharacterData[] = [
  {
    name: 'Angelina',
    imageKey: 'char-Angelina',
    description: 'Determinada e corajosa',
    color: 0x333333,
    victoryPhrase: 'Ninguém para a Angelina!',
  },
  {
    name: 'Anne',
    imageKey: 'char-Anne',
    description: 'Alegre e criativa',
    color: 0xe91e8c,
    victoryPhrase: 'Criatividade vence a poluição!',
  },
  {
    name: 'Lazaro',
    imageKey: 'char-Lazaro',
    description: 'Forte e estratégico',
    color: 0x2e7d32,
    victoryPhrase: 'Força verde em ação!',
  },
  {
    name: 'Pietro',
    imageKey: 'char-Pietro',
    description: 'Ágil e inteligente',
    color: 0x333333,
    victoryPhrase: 'Inteligência é o melhor poder!',
  },
  {
    name: 'Pinheiro',
    imageKey: 'char-Pinheiro',
    description: 'Disciplinado e líder',
    color: 0x795548,
    victoryPhrase: 'Disciplina salva o meio ambiente!',
  },
];
