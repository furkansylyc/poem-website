export interface Poem {
  _id: string;
  title: string;
  content: string;
  date: string;
  views: number;
}

export interface Comment {
  _id: string;
  poemId: string | { _id: string; title: string };
  name: string;
  comment: string;
  date: string;
  approved: boolean;
} 