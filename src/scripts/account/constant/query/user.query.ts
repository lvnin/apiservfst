/*
 * author: ninlyu.dev@outlook.com
 */
export const QueryUserInfo = (alias?: string): string[] | any => {
  const query = {
    id: true,
    isAuth: true,
    username: true,
    nickname: true,
    avatar: true,
    gender: true,
  };

  return alias ? Object.keys(query).map((field) => `${alias}.${field}`) : query;
};

export const QueryProfileInfo = (alias?: string): string[] | any => {
  const query = {
    id: true,
    isAuth: true,
    mobile: true,
    username: true,
    nickname: true,
    avatar: true,
    gender: true,
    bio: true,
    bgpic: true,
    location: true,
    createdAt: true,
  };

  return alias ? Object.keys(query).map((field) => `${alias}.${field}`) : query;
};

export const QuerySessionInfo = (alias?: string): string[] | any => {
  const query = {
    id: true,
    isAuth: true,
    username: true,
    nickname: true,
    avatar: true,
    gender: true,
    forbidden: true,
    status: true,
  };

  return alias ? Object.keys(query).map((field) => `${alias}.${field}`) : query;
};
