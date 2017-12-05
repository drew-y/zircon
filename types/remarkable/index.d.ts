declare module 'remarkable' {
  class Remarkable {
    constructor(opts?: { [index: string]: any });
    render(markdown: string): string;
    use(...args: any[]): this;
  }

  export = Remarkable;
}
