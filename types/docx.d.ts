declare module 'docx' {
  export class Document {
    constructor(options: any);
  }
  
  export class Paragraph {
    constructor(options: any);
  }
  
  export class Packer {
    static toBlob(doc: Document): Promise<Blob>;
  }
}

declare module 'file-saver' {
  export function saveAs(data: Blob, filename: string): void;
} 