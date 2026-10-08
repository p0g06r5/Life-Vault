// Require an authenticated session before serving LifeVault's private UI.
// The intentionally public /share route contains only the explicitly shared snapshot.
export async function onRequest({request,env,next}){
 const url=new URL(request.url);
 const p=url.pathname;
 if(request.method!=='GET'&&request.method!=='HEAD')return next();
 if(p==='/share'||p.startsWith('/share/')||p==='/login'||p==='/register'||p.startsWith('/api/')||p.startsWith('/assets/')||p.startsWith('/_')||p==='/favicon.ico'||p==='/robots.txt'||/\.(?:js|css|png|jpg|jpeg|webp|svg|woff2?|ico|json|txt|map)$/i.test(p))return next();
 if(!env.BACKEND_API)return Response.redirect(url.origin+'/login',302);
 let ok=false;
 try{
  const check=await env.BACKEND_API.fetch(new Request(url.origin+'/api/v1/auth/me',{method:'GET',headers:{cookie:request.headers.get('cookie')||''}}));
  ok=check.ok;
 }catch{}
 if(!ok){
  return new Response(null,{status:302,headers:{Location:url.origin+'/login','Cache-Control':'private, no-store'}});
 }
 const response=await next();const headers=new Headers(response.headers);headers.set('Cache-Control','private, no-store');return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
