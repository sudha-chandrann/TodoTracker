import { NextRequest, NextResponse } from 'next/server';

 
// This function can be marked `async` if using `await` inside
export function middleware(request) {
    if (!(request instanceof NextRequest)) {
        console.error('Invalid request object');
        return NextResponse.json({ message: 'Invalid request object' }, { status: 400 });
      }
    const path=request.nextUrl.pathname;

    const isPublicPath=path==='/login'|| path ==='/register'||path=="/home";
   const token= request.cookies.get('refreshToken')?.value||"";
   if(isPublicPath && token ){
    return NextResponse.redirect(new URL('/dashboard',request.nextUrl));
   }
   else if(!isPublicPath && !token){
    return NextResponse.redirect(new URL('/home',request.nextUrl));
   }


}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher:[ '/dashboard/:path*',
    '/login',
    '/register',
    '/home'
  ]
}