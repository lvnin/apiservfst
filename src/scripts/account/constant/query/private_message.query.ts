/*
 * author: ninlyu.dev@outlook.com
 */

export const QueryPrivMsgInfo = (alias?: string): string[] | any => {
  const query = {
    id: true,
    sender: true,
    content: true,
    createdAt: true,
  };

  return alias ? Object.keys(query).map((field) => `${alias}.${field}`) : query;
};
