// Downsize account portraits in-browser before submission to the D1 account API.
// No original image is uploaded; only the 112px JPEG portrait goes to the server.
export async function portraitData(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Choose a JPEG, PNG, or WebP photograph.');
 if(file.size>8*1024*1024)throw Error('Choose a photograph under 8 MB.');
 const image=await new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};
  img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('This image could not be opened.'))};
  img.src=url;
 });
 const canvas=document.createElement('canvas');canvas.width=112;canvas.height=112;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Photo processing is not supported by this browser.');
 const scale=Math.max(112/image.naturalWidth,112/image.naturalHeight);
 const width=image.naturalWidth*scale,height=image.naturalHeight*scale;
 ctx.fillStyle='#f1f3ee';ctx.fillRect(0,0,112,112);
 ctx.drawImage(image,(112-width)/2,(112-height)/2,width,height);
 for(const quality of [.78,.63,.49,.35]){
  const data=canvas.toDataURL('image/jpeg',quality);
  if(data.length<42000)return data;
 }
 throw Error('Unable to optimize this picture. Try a different photo.');
}
