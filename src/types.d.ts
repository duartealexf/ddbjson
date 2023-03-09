interface Handler {
  handle(actionFn: (data: any) => any, subject: string, property?: string): void;
}

interface HandledStream {
  on(event: 'data', handler: (data: string) => void): void;
  on(event: 'end', handler: () => void): void;
}

interface CLI {
  run(): void;
}

interface PathHelper {
  isAbsolutePath: (path: string) => boolean;
  ensureAbsolutePath: (path: string) => string;
}

interface StringHelper {
  trim: (str: string) => string;
  trimJSON: (str: string) => string;
}
