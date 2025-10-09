export const meta={id:"baroque-cadence",name:"Baroque Cadence"};
export function applyStyle({bars,tempo,chords,phraseLength=4,variation=0.5,octave=0}){
  const events=[]; const B=4;
  chords.forEach((c,i)=>{
    const start=i*B;
    const v=(c.voicing??c.pcs??[]).slice(0,3).map(p=>p+octave*12);
    v.forEach((p,idx)=>{
      events.push({pitch:p-1,start:start+0.0,dur:0.08,vel:70-idx*5});
      events.push({pitch:p,  start:start+0.08,dur:1.6, vel:88-idx*6});
    });
    if(i===bars-1){ v.forEach((p,idx)=>events.push({pitch:p,start:start+3.0,dur:0.5,vel:92-idx*6})); }
  });
  return {tempo,events};
}
