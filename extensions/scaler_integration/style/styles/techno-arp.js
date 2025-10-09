export const meta={id:"techno-arp",name:"Techno 16th Arp"};
export function applyStyle({bars,tempo,chords,phraseLength=4,variation=0.5,octave=0}){
  const events=[]; const B=4;
  chords.forEach((c,i)=>{
    const bar=i*B;
    const tri=(c.voicing??c.pcs??[]).slice(0,3).map(p=>p+octave*12);
    for(let s=0;s<16;s++){
      const pitch=tri[s%tri.length];
      events.push({pitch,start:bar+s*0.25,dur:0.22,vel:84});
    }
  });
  return {tempo,events};
}
