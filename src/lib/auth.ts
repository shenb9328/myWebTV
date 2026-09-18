import { NextRequest } from 'next/server';

// 从cookie获取认证信息 (服务端使用)
export function getAuthInfoFromCookie(request: NextRequest): {
  password?: string;
  username?: string;
  signature?: string;
  timestamp?: number;
  role?: 'owner' | 'admin' | 'user';
} | null {
  const authCookie = request.cookies.get('auth');

  if (authCookie) {
    try {
      const decoded = decodeURIComponent(authCookie.value);
      const authData = JSON.parse(decoded);
      if (authData && authData.username) return authData;
    } catch (error) {
      // 忽略解析错误
    }
  }

  // 免登录模式：默认使用 admin owner 身份
  return {
    username: process.env.USERNAME || 'admin',
    role: 'owner',
  };
}

// 从cookie获取认证信息 (客户端使用)
export function getAuthInfoFromBrowserCookie(): {
  password?: string;
  username?: string;
  signature?: string;
  timestamp?: number;
  role?: 'owner' | 'admin' | 'user';
} | null {
  if (typeof window === 'undefined') {
    return {
      username: 'admin',
      role: 'owner',
    };
  }

  try {
    // 解析 document.cookie
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const trimmed = cookie.trim();
      const firstEqualIndex = trimmed.indexOf('=');

      if (firstEqualIndex > 0) {
        const key = trimmed.substring(0, firstEqualIndex);
        const value = trimmed.substring(firstEqualIndex + 1);
        if (key && value) {
          acc[key] = value;
        }
      }

      return acc;
    }, {} as Record<string, string>);

    const authCookie = cookies['auth'];
    if (authCookie) {
      // 处理可能的双重编码
      let decoded = decodeURIComponent(authCookie);
      if (decoded.includes('%')) {
        decoded = decodeURIComponent(decoded);
      }
      const authData = JSON.parse(decoded);
      if (authData && authData.username) return authData;
    }
  } catch (error) {
    // 忽略解析错误
  }

  // 免登录模式：默认返回 admin / owner 身份
  return {
    username: 'admin',
    role: 'owner',
  };
}
