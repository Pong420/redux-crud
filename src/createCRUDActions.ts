import { CRUDState } from './createCRUDReducer';
import { AllowedNames, PagePayload, ValueOf } from './typings';

export type UnionCRUDActions<
  T extends Record<string, (...args: any[]) => any>
> = ReturnType<T[keyof T]>;

export type CRUDActionsBase<
  I extends Record<PropertyKey, any> = any,
  K extends AllowedNames<I, PropertyKey> = any
> =
  | { sub: 'RESET' }
  | { sub: 'CREATE'; payload: I }
  | { sub: 'DELETE'; payload: Pick<I, K> }
  | {
      sub: 'UPDATE';
      payload: Pick<I, K> & Partial<I>;
    }
  | { sub: 'PAGINATE'; payload: PagePayload<I> }
  | { sub: 'SET_PAGE'; payload: number }
  | { sub: 'SET_SEARCH'; payload?: string }
  | {
      sub: 'FORCE_UPDATE';
      payload: Partial<CRUDState<I, K>>;
    };

export type CRUDActionsTypes = CRUDActionsBase['sub'];

export type DefaultCRUDActions = { [X in CRUDActionsTypes]?: string };

type ExtractActions<A, K> = A extends { sub: K } ? A : never;

type Map<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>,
  A extends DefaultCRUDActions = DefaultCRUDActions
> = {
  [X in keyof A]: ExtractActions<CRUDActionsBase<I, K>, X> & {
    type: A[X];
  };
};

export type CRUDActions<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>,
  A extends DefaultCRUDActions = DefaultCRUDActions
> = ValueOf<Map<I, K, A>>;

export function createCRUDActions<
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>
>() {
  return <T extends string, M extends { [x: string]: [CRUDActionsTypes, T] }>(
    map: M
  ) => {
    type Types = { [X in M[keyof M][0]]: M[keyof M][1] };

    type ActionCreator<
      Key extends keyof Types,
      Action = Map<I, K, Types>[Key]
    > = Action extends {
      payload: any;
    }
      ? (
          payload: Action['payload']
        ) => {
          type: Types[Key];
          sub: Key;
          payload: Action['payload'];
        }
      : (payload?: undefined) => { type: Types[Key]; sub: Key };

    const result = {} as {
      [Key in keyof M]: ActionCreator<M[Key][0]>;
    };

    const actionsTypes = {} as Types;

    for (const key in map) {
      const [sub, type]: [keyof Types, ValueOf<Types>] = map[key];

      actionsTypes[sub] = type;

      result[key] = ((payload?: any) => ({
        type,
        payload,
        sub
      })) as any;
    }

    return [result, actionsTypes] as const;
  };
}
