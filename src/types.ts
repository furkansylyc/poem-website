export interface Poem {
  _id: string;
  title: string;
  content: string;
  date: string;
}

export interface Comment {
  _id: string;
  poemId: string;
  name: string;
  comment: string;
  date: string;
  approved: boolean;
} 