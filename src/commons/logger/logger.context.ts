import { Observable } from 'rxjs';
import { AsyncLocalStorage } from 'async_hooks';

const storage = new AsyncLocalStorage<unknown>();

export const LoggerContext = {
  run(context: unknown, callback: () => Observable<unknown>) {
    return storage.run(context, callback);
  },
  get() {
    return storage.getStore() ?? {};
  },
  set(key: string, value: Record<string, unknown>) {
    const store = storage.getStore();
    if (store) {
      store[key] = value;
    }
  },
  append(key: string, value: Record<string, unknown>) {
    const store = storage.getStore();
    if (store) {
      const current = store[key] ?? {};
      const currentTypeString = typeof current === 'string';

      if (currentTypeString) return;

      store[key] = {
        ...current,
        ...value,
      };
    }
  },
};
