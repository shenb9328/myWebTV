/* eslint-disable no-console */

import { NextRequest, NextResponse } from 'next/server';

import { getAuthInfoFromCookie } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 如果访问登录页，直接重定向回首页
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  // 若无 auth cookie，自动发放长期免登录凭证（默认超级管理员身份）
  const authCookie = request.cookies.get('auth');
  if (!authCookie) {
    const defaultAuth = encodeURIComponent(
      JSON.stringify({
        username: process.env.USERNAME || 'admin',
        role: 'owner',
      })
    );
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 10);
    response.cookies.set('auth', defaultAuth, {
      path: '/',
      expires,
      sameSite: 'lax',
      httpOnly: false,
    });
  }

  return response;
}

// 验证签名
async function verifySignature(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  try {
    // 导入密钥
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // 将十六进制字符串转换为Uint8Array
    const signatureBuffer = new Uint8Array(
      signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    // 验证签名
    return await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      messageData
    );
  } catch (error) {
    console.error('签名验证失败:', error);
    return false;
  }
}

// 处理认证失败的情况
function handleAuthFailure(
  request: NextRequest,
  pathname: string
): NextResponse {
  // 如果是 API 路由，返回 401 状态码
  if (pathname.startsWith('/api')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 否则重定向到登录页面
  const loginUrl = new URL('/login', request.url);
  // 保留完整的URL，包括查询参数
  const fullUrl = `${pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set('redirect', fullUrl);
  return NextResponse.redirect(loginUrl);
}

// 判断是否需要跳过认证的路径
function shouldSkipAuth(pathname: string): boolean {
  const skipPaths = [
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/manifest.json',
    '/sw.js',
    '/workbox-',
    '/icons/',
    '/logo.png',
    '/screenshot.png',
  ];

  return skipPaths.some((path) => pathname.startsWith(path) || pathname === path);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*\\.js|icons/.*|logo.png|login|warning|api/login|api/register|api/logout|api/cron|api/server-config).*)',
  ],
};
