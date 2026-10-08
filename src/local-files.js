// User-owned, device-local binary attachments. No Cloudflare storage costs or uploads.
const DB='lifevault-private-files';const STORE='files';
function open(){
 return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>request.result.createObjectStore(STORE);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
}
async function transact(key,mode,operation,value){
 const db=await open();
 return new Promise((resolve,reject)=>{
  const transaction=db.transaction(STORE,mode);const store=transaction.objectStore(STORE);
  const r=operation==='put'?store.put(value,key):operation==='delete'?store.delete(key):store.get(key);
  r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
  transaction.oncomplete=()=>db.close();
  transaction.onerror=()=>{db.close();reject(transaction.error)};
 });
}
const makeKey=(userId,id)=>String(userId)+':cert:'+String(id);
export async function storeCertification(userId,id,file){
 if(!file||!['application/pdf','image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Upload a PDF, JPEG, PNG, or WebP certificate.');
 if(file.size>6*1024*1024)throw Error('Certificate must be smaller than 6 MB.');
 await transact(makeKey(userId,id),'readwrite','put',{name:file.name,type:file.type,blob:file});
 return {attachmentName:file.name,attachmentType:file.type};
}
export async function downloadCertification(userId,id){
 const item=await transact(makeKey(userId,id),'readonly','get');
 if(!item)throw Error('This certificate is available only on the device where it was uploaded.');
 const link=document.createElement('a'),url=URL.createObjectURL(item.blob);
 link.href=url;link.download=item.name||'certificate';document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function deleteCertification(userId,id){await transact(makeKey(userId,id),'readwrite','delete')}
