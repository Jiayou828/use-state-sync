import { useEffect, useMemo, useRef, useState } from "react";

type StateObject<T> = {
  readonly value: T;
  readonly [key: string]: T;
};

type CallbackFn = (() => void) | null | undefined;

type SetStateEffect<T> = (
  newState: T | StateUpdater<T>,
  callback?: CallbackFn
) => void;

type StateUpdater<T> = (prevState: StateObject<T>) => T;

type InitialState<T> = T | (() => T);

interface StateRef<T> {
  state: T;
  callback: (() => void) | null;
  setCallback(callback: (() => void) | null): void;
  setState(newState: T): void;
}

function isFunction(value: unknown): value is StateUpdater<unknown> {
  return typeof value === "function";
}

function isValidCallback(value: unknown): value is () => void {
  return typeof value === "function";
}

export default function useStateSync<T>(
  initialState?: InitialState<T>
): readonly [state: StateObject<T>, setStateEffect: SetStateEffect<T>] {
  const [state, setState] = useState(initialState);

  const stateRef = useRef({
    state: state as T,
    callback: null,
    setCallback(callback: (() => void) | null): void {
      this.callback = callback;
    },
    setState(newState: T): void {
      this.state = newState;
    },
    } as StateRef<T>);

  useEffect(() => {
    stateRef.current.state = state as T;
    
    return (): void => {
      stateRef.current.callback = null;
    };
  }, []);

  const stateObject = useMemo(() => {
    return new Proxy({} as StateObject<T>, {
      get(_target, prop): any {
        if (prop === 'valueOf' || prop === Symbol.toPrimitive) {
          return (): T => stateRef.current.state;
        }
        if (prop === 'toString') {
          return (): string => String(stateRef.current.state);
        }
        return stateRef.current.state;
      },
      has(_target, _prop): boolean {
        return true;
      },
      ownKeys(_target): string[] {
        return ['value'];
      },
      getOwnPropertyDescriptor(_target, prop): PropertyDescriptor | undefined {
        if (prop === 'value' || typeof prop === 'string') {
          return {
            enumerable: true,
            configurable: true,
            get(): T {
              return stateRef.current.state;
            },
          };
        }
        return undefined;
      },
    });
  }, []);

  useEffect(() => {
    const callback = stateRef.current.callback;
    if (callback) {
      try {
        callback();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(errorMessage);
      } finally {
        stateRef.current.callback = null;
      }
    }
  }, [state]);

  const setStateEffect: SetStateEffect<T> = (
    newState: T | StateUpdater<T>,
    callback?: CallbackFn
  ): void => {
    const actualNewState: T = isFunction(newState)
      ? (newState as StateUpdater<T>)(stateObject)
      : (newState as T);

    stateRef.current.setState(actualNewState);

    if (isValidCallback(callback)) {
      stateRef.current.setCallback(callback);
    } else if (callback === null || callback === undefined) {
      stateRef.current.setCallback(null);
    }

    setState(actualNewState);
  };

  return [stateObject, setStateEffect] as const;
}
