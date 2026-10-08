import React,{useState} from 'react';
import {Sparkles,Check,X,RotateCcw} from 'lucide-react';
import './ai.css';
export default function AiSuggest({purpose,text,onApply,label='Improve with AI',disabled=false}){
 const [loading,setLoading]=useState(false),[suggestion,setSuggestion]=useState(''),[error,setError]=useState('');
 const generate=async()=>{
  if(loading||!String(text||'').trim())return;
  setLoading(true);setError('');setSuggestion('');
  try{
   const response=await fetch('/api/assist',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({purpose,text:String(text).slice(0,4500)})});
   const json=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(json.error||'AI is unavailable. Try again later.');
   if(!json.suggestion)throw Error('No suggestion was returned.');
   setSuggestion(json.suggestion);
  }catch(e){setError(e.message||'Could not generate a suggestion.')}
  finally{setLoading(false)}
 };
 return <div className="ai-assist"><button className="ai-trigger" type="button" disabled={disabled||loading||!String(text||'').trim()} onClick={generate}><Sparkles size={15}/>{loading?'Thinking…':label}</button>{!suggestion&&!error&&<small>Optional · sends only the text shown here to Cloudflare AI when you click. Free-tier limits apply.</small>}{error&&<div className="ai-error" role="status">{error}</div>}{suggestion&&<div className="ai-result"><div className="ai-result-title"><Sparkles size={15}/> Suggested draft <button type="button" onClick={()=>setSuggestion('')} aria-label="Dismiss suggestion"><X size={15}/></button></div><p>{suggestion}</p><div className="ai-result-actions"><button type="button" onClick={()=>{onApply(suggestion);setSuggestion('')}}><Check size={15}/> Use suggestion</button><button type="button" onClick={generate}><RotateCcw size={14}/> Try again</button></div><small>Your original text is unchanged until you choose “Use suggestion.” Review for accuracy.</small></div>}</div>;
}