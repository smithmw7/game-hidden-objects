export interface HiddenObject {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  found?: boolean;
}

export interface Level {
  id: string;
  code: string;
  creatorId: string;
  title: string;
  imagePath: string;
  thumbnailPath: string;
  imageUrl: string;
  objects: HiddenObject[];
  playCount: number;
  visibility: "public" | "private";
  createdAt: number;
}

export interface Wallet {
  uid: string;
  coins: number;
  tokens: number;
}
