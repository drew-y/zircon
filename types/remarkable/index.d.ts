declare module 'remarkable' {
  class Remarkable {
    constructor();
    render(markdown: string): string;
  }

  export = Remarkable;
}
