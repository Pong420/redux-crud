import { Dispatch as ReactDispatch } from 'react';

interface AnyAction {
  type: any;
  [extraProps: string]: any;
}

interface ActionCreators {
  [k: string]: (...args: any[]) => AnyAction;
}

type Handler<A extends ActionCreators> = {
  [X in keyof A]: (...args: Parameters<A[X]>) => void;
};

export function withDispatch<A extends ActionCreators>(
  creators: A,
  dispatch: ReactDispatch<any>
) {
  const handler = {} as Handler<A>;
  const keys = Object.keys(creators) as Array<keyof A>;
  for (const key of keys) {
    const creator = creators[key];
    handler[key] = (...args: Parameters<typeof creator>) => {
      dispatch(creator(...args));
    };
  }

  return handler;
}
