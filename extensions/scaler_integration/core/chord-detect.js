const NOTE_NAMES_SHARP=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const nameSharp = pc => NOTE_NAMES_SHARP[((pc%12)+12)%12];
const TEMPLATES = [
  { name:"maj",set:[0,4,7] },{ name:"min",set:[0,3,7] },{ name:"dim",set:[0,3,6] },{ name:"aug",set:[0,4,8] },
  { name:"sus2",set:[0,2,7] },{ name:"sus4",set:[0,5,7] },{ name:"7",set:[0,4,7,10] },{ name:"maj7",set:[0,4,7,11] },
  { name:"m7",set:[0,3,7,10] },{ name:"5",set:[0,7] }
];
const strategies=[];
export function use(s){ strategies.push(s); }
export function detect(pcs,bassPC=null){
  for(const s of strategies){ const r=s(pcs,bassPC); if(r) return r; }
  if(!pcs?.length) return {label:"(no-chord)",conf:0};
  return {label:nameSharp(pcs[0]),conf:0.2};
}
export function triadSeventhStrategy(pcs,bassPC){
  if(!pcs||pcs.length<2) return null;
  let best=null;
  for(const root of pcs){
    const norm=pcs.map(pc=>((pc-root+12)%12)).sort((a,b)=>a-b);
    for(const t of TEMPLATES){
      const tpl=t.set.map(x=>x%12).sort((a,b)=>a-b);
      const ok=tpl.every(iv=>norm.includes(iv));
      if(!ok) continue;
      const extras=norm.filter(iv=>!tpl.includes(iv)).length;
      const inv=(bassPC!=null&&bassPC!==root)?1:0;
      const score=extras+inv;
      if(!best||score<best.score) best={root,quality:t.name,score,inv};
    }
  }
  if(!best) return null;
  return {label:nameSharp(best.root)+best.quality,rootPC:best.root,quality:best.quality,inversion:!!best.inv,conf:1-best.score*0.2};
}
export function powerClusterStrategy(pcs){
  if(pcs.length===2){
    const [a,b]=pcs; const d=(b-a+12)%12;
    if(d===7||d===5) return {label:nameSharp(Math.min(a,b))+"5",quality:"5",conf:0.6};
  }
  if(pcs.length>=4) return {label:"cluster",conf:0.3};
  return null;
}
export function triadFromLabel(label){
  if(!label||label==='(no-chord)') return null;
  const map={C:0,"C#":1,Db:1,D:2,"D#":3,Eb:3,E:4,F:5,"F#":6,Gb:6,G:7,"G#":8,Ab:8,A:9,"A#":10,Bb:10,B:11};
  const m=label.match(/^([A-G](?:#|b)?)(.*)$/); if(!m) return null;
  const r=map[m[1]]; if(r==null) return null;
  const q=(m[2]||"").trim();
  if(/^m(?!aj)/.test(q)) return [r,(r+3)%12,(r+7)%12];
  if(/dim/.test(q))     return [r,(r+3)%12,(r+6)%12];
  if(/aug/.test(q))     return [r,(r+4)%12,(r+8)%12];
  if(/sus2/.test(q))    return [r,(r+2)%12,(r+7)%12];
  if(/sus4/.test(q))    return [r,(r+5)%12,(r+7)%12];
  return [r,(r+4)%12,(r+7)%12];
}
