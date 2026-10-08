// Set Cloudflare Pages Service binding BACKEND_API -> life-vault-backend.
// Same-origin proxy keeps HttpOnly account cookies on the frontend domain.
export async function onRequest(context){
 if(!context.env.BACKEND_API)return new Response(JSON.stringify({error:'Account service is not connected. Add BACKEND_API service binding to your Pages project.'}),{status:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 return context.env.BACKEND_API.fetch(context.request);
}