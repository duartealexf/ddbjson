type ObjectLike = Record<string, unknown>;

type ValidJSON = ObjectLike | ObjectLike[];

type MockedInterface<T> = T extends Record<string, any>
  ? {
      [P in keyof T]: T[P] extends (...args: any) => any
        ? jest.Mock<ReturnType<T[P]>, Parameters<T[P]>>
        : T[P]
    }
  : never

type Action = 'marshall' | 'unmarshall';

interface Handler {
  handle(action: Action, subject: string, property?: string): void;
}

interface HandledStream {
  on(event: 'data', handler: (data: string) => void): void;
  on(event: 'end', handler: () => void): void;
}

interface CLI {
  run(): void;
}

interface Utils {
  trim: (str: string) => string;
  trimJSON: (str: string) => string;
  isAbsolutePath: (path: string) => boolean;
  ensureAbsolutePath: (path: string) => string;
}
