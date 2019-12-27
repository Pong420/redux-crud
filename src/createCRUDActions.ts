import { CRUDState } from './createCRUDReducer';
import { AllowedNames, PagePayload } from './typings';

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
  A extends Required<DefaultCRUDActions> = Required<DefaultCRUDActions>
> = Map<I, K, A>[CRUDActionsTypes];

export function getCRUDActionCreator<
  Types extends { [T in CRUDActionsTypes]?: string },
  I extends Record<PropertyKey, any>,
  K extends AllowedNames<I, PropertyKey>
>(actions: Types) {
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
    [Key in keyof Types]: ActionCreator<Key>;
  };

  for (const sub in result) {
    result[sub] = ((payload?: any) => ({
      type: actions[sub],
      payload,
      sub,
    })) as any;
  }

  return result;
}
