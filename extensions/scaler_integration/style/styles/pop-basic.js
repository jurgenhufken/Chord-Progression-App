export const meta={id:"pop-basic",name:"Pop Basic"};
export function applyStyle({bars,tempo,chords,phraseLength=4,variation=0.5,octave=0}){
  const events=[]; const B=4;
  chords.forEach((c,i)=>{
    const bar=i*B;
    const v=(c.voicing??c.pcs??[]).slice(0,3).map(p=>p+octave*12);
    v.forEach((p,idx)=>events.push({pitch:p,start:bar+0+idx*0.25,dur:3.5,vel:90-idx*8}));
    if(((i%phraseLength)===phraseLength-1)&&variation>0.3&&v[0]){
      events.push({pitch:v[0]+2,start:bar+1.5,dur:0.25,vel:85});
      events.push({pitch:v[1]+2,start:bar+3.0,dur:0.25,vel:85});
    }
  });
  return {tempo,events};
}
