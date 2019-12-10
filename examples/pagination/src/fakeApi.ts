const rid = (length = 5) => {
  const s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length }, () =>
    s.charAt(Math.floor(Math.random() * s.length))
  ).join("");
};

const delay = (ms: number) => new Promise(_ => setTimeout(_, ms));

const data = Array.from({ length: 100 }, (_, index) => ({
  index,
  id: rid(10),
  username: rid(8),
  email: `${rid(8)}@gmail.com`
}));

export interface Param$Pagination {
  pageNo: number;
  pageSize: number;
}

export type Schema$User = (typeof data)[number];

export const api = async ({ pageNo, pageSize }: Param$Pagination) => {
  await delay(1000);
  const start = (pageNo - 1) * pageSize;
  return {
    data: data.slice(start, start + pageSize),
    total: data.length,
    pageNo,
    pageSize
  };
};
