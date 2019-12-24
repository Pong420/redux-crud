export * from './transformDatabyId';

export function parsePageNo(payload: any) {
  const pageNo = Number(payload);
  return isNaN(pageNo) ? 1 : pageNo;
}

export function removeFromArray<T>(arr: T[], index: number) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}
