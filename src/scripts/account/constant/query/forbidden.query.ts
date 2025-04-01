/*
 * author: ninlyu.dev@outlook.com
 */
export const QueryForbiddenInfo = (alias?: string): string[] | any => {
  const query = {
    id: true,
    desc: true,
    explain: true,
    duration: true,
    appealTimes: true,
    appealContent: true,
    appealAt: true,
    createdAt: true,
    status: true,
  };

  return alias ? Object.keys(query).map((field) => `${alias}.${field}`) : query;
};
