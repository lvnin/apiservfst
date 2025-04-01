/*
 * author: ninlyu.dev@outlook.com
 */
export default {
  ERR_VALID_SUCCESS: { code: 0, message: '验证成功' },
  ERR_LOGON_SUCCESS: { code: 0, message: '登录成功' },
  ERR_CREAT_SUCCESS: { code: 0, message: '创建成功' },
  ERR_UPDATE_SUCCESS: { code: 0, message: '更新成功' },
  ERR_DELETE_SUCCESS: { code: 0, message: '删除成功' },
  ERR_AUTH_OK: { code: 0, message: '已验证' },
  ERR_SIGNIN_OK: { code: 0, message: '已登录' },
  ERR_CREAT_OK: { code: 0, message: '已创建' },
  ERR_UPDATE_OK: { code: 0, message: '已更新' },
  ERR_DELETE_OK: { code: 0, message: '已删除' },
  ERR_TOKEN_INVALID: { code: 10000, message: '登录无效' },
  ERR_TOKEN_EXPIRED: { code: 10001, message: '登录已过期' },
  ERR_LOGON_FAILURE: { code: 10002, message: '登录失败' },
  ERR_CREAT_FAILURE: { code: 10010, message: '创建失败' },
  ERR_UPDATE_FAILURE: { code: 10011, message: '更新失败' },
  ERR_DELETE_FAILURE: { code: 10012, message: '删除失败' },
  ERR_OPERATE_FREQUENT: { code: 10101, message: '操作频发,请稍后再试' },
  ERR_SERVER_INTERNAL_ERROR: { code: 10102, message: '服务器内部错误' },
  ERR_ACCOUNT_UNREGISTERED: { code: 20000, message: '账号未注册' },
  ERR_ACCOUNT_NONEXIST: { code: 20001, message: '账号不存在' },
  ERR_ACCOUNT_EXISTS: { code: 20002, message: '账号已存在' },
  ERR_ACCOUNT_FORBIDDEN: { code: 20003, message: '账号已被封禁' },
  ERR_ACCOUNT_SIGNUP_FAILURE: { code: 20004, message: '账号注册失败' },
  ERR_ACCOUNT_WAS_AUTHED: { code: 20005, message: '身份信息已被实名认证' },
  ERR_ACCOUNT_WAS_DESTROYED: { code: 20006, message: '账号已注销' },
  ERR_ACCOUNT_DESTROY_FAILURE: { code: 20007, message: '账号注销失败' },
};
