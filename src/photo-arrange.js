// Private, deterministic visual mixing. Reads pixel colors locally, never sends images anywhere.
// This is an image-arrangement heuristic, not a vision model and does not infer content.
function photoColor(photo){
 return new Promise(resolve=>{
  const img=new Image();
  if(/^https?:/.test(photo.url))img.crossOrigin='anonymous';
  img.onload=()=>{
   try{
    const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,32,32);
    const pixels=ctx.getImageData(0,0,32,32).data;
    let r=0,g=0,b=0,contrast=0;const n=pixels.length/4;
    for(let i=0;i<pixels.length;i+=4){r+=pixels[i];g+=pixels[i+1];b+=pixels[i+2]}
    const average=[r/n,g/n,b/n];
    const light=(average[0]+average[1]+average[2])/3;
    for(let i=0;i<pixels.length;i+=4){const value=(pixels[i]+pixels[i+1]+pixels[i+2])/3;contrast+=(value-light)**2}
    resolve({photo,colors:average,contrast:Math.sqrt(contrast/n)});
   }catch{resolve({photo,colors:[120,130,125],contrast:0})}
  };
  img.onerror=()=>resolve({photo,colors:[120,130,125],contrast:0});
  img.src=photo.url;
 });
}
function distance(a,b){
 return Math.sqrt(a.colors.reduce((sum,v,i)=>sum+(v-b.colors[i])**2,0));
}
export async function arrangePhotos(photos){
 if(photos.length<3)return photos;
 const scores=await Promise.all(photos.map(photoColor));
 const remaining=[...scores];
 // Start with a visually rich cover; alternate contrasting frames to create rhythm.
 remaining.sort((a,b)=>b.contrast-a.contrast);
 const result=[remaining.shift()];
 while(remaining.length){
  const last=result[result.length-1];
  remaining.sort((a,b)=>distance(last,b)-distance(last,a));
  result.push(remaining.shift());
 }
 return result.map(x=>x.photo);
}
