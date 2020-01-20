import { CRUDState } from './createCRUDReducer';
import { AllowedNames, PagePayload, ValueOf, ParsedQuery } from './typings';

export type UnionCRUDActions<
  T extends Record<string, (...args: any[]) => any>
> = ReturnType<T[keyof T]>;

export type CRUDActionsBase<
  I extends Record<PropertyKey, any> = any,
  K extends AllowedNames<I, PropertyKey> = any
> =
  | { sub: 'CREATE'; payload: I }
  | { sub: 'DELETE'; payload: Pick<I, K> }
  | {
      sub: 'UPDATE';
      payload: Pick<I, K> & Partial<I>;
    }
  | { sub: 'PAGINATE'; payload: PagePayload<I> }
  | { sub: 'SET_PAGE'; payload: number }
  | { sub: 'SET_PARAMS'; payload: ParsedQuery }
  | { sub: 'RESET'; payload?: Partial<CRUDState<I, K>> };

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
    type TupleToObject<T extends [CRUDActionsTypes, any]> = {
      [key in T[0]]: Extract<T, [key, any]>[1];
    };

    type Types = TupleToObject<M[keyof M]>;

    type ActionCreator<
      Key extends keyof M,
      Action = Map<I, K, Types>[M[Key][0]]
    > = Action extends {
      payload: any;
    }
      ? (
          payload: Action['payload']
        ) => {
          type: M[Key][1];
          sub: M[Key][0];
          payload: Action['payload'];
        }
      : (payload?: undefined) => { type: M[Key][1]; sub: M[Key][0] };

    const result = {} as {
      [Key in keyof M]: ActionCreator<Key>;
    };

    const actionsTypes = {} as Types;

    for (const key in map) {
      const [sub, type] = map[key];

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
