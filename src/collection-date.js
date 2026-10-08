// Format optional partial month/year dates without pretending a day was supplied.
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
export function formatCollectionDate(input){
 if(typeof input!=='string'||!input.trim())return '';
 const match=input.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
 if(!match)return input.slice(0,80);
 const year=Number(match[1]),month=Number(match[2]),day=match[3]?Number(match[3]):null;
 if(month<1||month>12)return input;
 if(day!==null){
  const max=new Date(Date.UTC(year,month,0)).getUTCDate();
  if(day<1||day>max)return input;
  return months[month-1]+' '+day+', '+year;
 }
 return months[month-1]+' '+year;
}
