// https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c
export type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};

export type AllowedNames<Base, Condition> = FilterFlags<
  Base,
  Condition
>[keyof Base];

export type ValueOf<T> = T[keyof T];

export interface PagePayload<T> {
  data: T[];
  total: number;
  pageNo: number;
}

export function isPagePayload<T>(obj: any): obj is PagePayload<T> {
  return !!(
    obj &&
    typeof obj === 'object' &&
    obj.hasOwnProperty('pageNo') &&
    obj.hasOwnProperty('data')
  );
}
