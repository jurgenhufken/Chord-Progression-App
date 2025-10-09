export const meta={id:"jazz-ii-v-i",name:"Jazz Comp II–V–I"};
export function applyStyle({bars,tempo,chords,phraseLength=4,variation=0.5,octave=0}){
  const events=[]; const B=4; const swing=0.08;
  chords.forEach((c,i)=>{
    const bar=i*B;
    const v=(c.voicing??c.pcs??[]).slice(0,3).map(p=>p+octave*12);
    [0,1.5+swing,3+swing*0.5].forEach((t,h)=>{
      v.forEach((p,idx)=>events.push({pitch:p,start:bar+t,dur:0.25,vel:88-idx*8-h*3}));
    });
  });
  return {tempo,events};
}
