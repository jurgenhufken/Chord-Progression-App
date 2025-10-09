import { AppAdapter } from '../adapters/app-adapter.js';
import { groupByBars, pitchClasses } from '../roll/segment.js';
import { detect, use, triadSeventhStrategy, powerClusterStrategy, triadFromLabel } from '../core/chord-detect.js';
import { registerStyle, getStyle } from '../style/registry.js';
import * as pop from '../style/styles/pop-basic.js';
import * as techno from '../style/styles/techno-arp.js';
import * as jazz from '../style/styles/jazz-ii-v-i.js';
import * as baroque from '../style/styles/baroque-cadence.js';
import { render } from '../engine/renderer.js';
import { makeEngine } from '../engine/audio-adapter.js';

registerStyle(pop.meta.id,pop);
registerStyle(techno.meta.id,techno);
registerStyle(jazz.meta.id,jazz);
registerStyle(baroque.meta.id,baroque);
use(triadSeventhStrategy);
use(powerClusterStrategy);

(function(){
  const app = window.App instanceof AppAdapter ? window.App : new AppAdapter(window.App || {});
  window.App = app;

  function nearestVoicing(prevVoicing, triadPCs, center=64){
    if(!triadPCs?.length) return prevVoicing||[60,64,67];
    if(!prevVoicing) return triadPCs.map(pc=>fit(pc,center-6,center+6));
    return prevVoicing.map(prev=>closestPitch(prev,triadPCs));
    function fit(pc,low,high){
      const p=((pc%12)+12)%12;
      let cand=low+((p-(low%12)+12)%12);
      if(cand>high) cand-=12;
      return cand;
    }
    function closestPitch(ref,pcs){
      let best=null,bestDist=1e9;
      for(const pc of pcs){
        for(let o=-2;o<=2;o++){
          const p=(pc+12*o)+(Math.floor(ref/12)*12);
          const d=Math.abs(p-ref);
          if(d<bestDist){best=p;bestDist=d;}
        }
      }
      return best??pcs[0]+60;
    }
  }

  function chordTimelineFromRoll(bars=app.lengthBars){
    const notes=app.getNotes();
    const bpb=app.beatsPerBar();
    const byBar=groupByBars(notes,bpb);
    const timeline=[]; let prevVoicing=null;
    for(let i=0;i<bars;i++){
      const ns=byBar.get(i)||[];
      const { pcs, bassPC } = pitchClasses(ns);
      const d=detect(pcs,bassPC,{});
      const tri=triadFromLabel(d?.label)||(pcs.length?pcs.slice(0,3):[0,4,7]);
      const voicing=nearestVoicing(prevVoicing,tri);
      timeline.push({bar:i+1,label:d?.label||'(no-chord)',pcs:tri,voicing});
      prevVoicing=voicing;
    }
    return timeline;
  }

  function updateStylePreview(styleId){
    const style=getStyle(styleId); if(!style) return;
    const bars=app.lengthBars;
    const tempo=app.getTempo();
    const chords=chordTimelineFromRoll(bars);
    const params={bars,tempo,chords,
      phraseLength: window.UI?.getPhraseLength?.() ?? 4,
      variation: window.UI?.getVariation?.() ?? 0.5,
      octave: window.UI?.getOctave?.() ?? 0
    };
    const { events } = style.applyStyle(params);
    const L=bars*app.beatsPerBar();
    app.stylePreview = events.filter(e=>e.start<L).map(e=>({...e,lane:app.stylePreviewLaneId,end:e.start+(e.dur??0.5)}));
    app.drawPreviewOverlay?.(app.stylePreview);
  }

  function commitStyleToRoll(){
    const preview=app.stylePreview||[]; if(!preview.length) return;
    const laneId="Style-"+Date.now();
    app.addLane?.(laneId,"Style – "+(window.UI?.getSelectedStyleName?.()||"Performance"));
    const notes=preview.map(e=>({pitch:e.pitch,start:e.start,end:e.end??(e.start+(e.dur??0.5)),vel:e.vel??90,lane:laneId}));
    app.addNotesToRoll?.(notes);
    app.stylePreview=[]; app.clearPreviewOverlay?.(); app.refreshRollUI?.();
  }

  function playStylePreview(){
    app.transportStop?.(); app.killAllVoices?.();
    const engine=makeEngine(app); render(app.stylePreview||[],engine); app.transportStart?.();
  }
  function playRoll(){
    app.transportStop?.(); app.killAllVoices?.();
    const notes=(app.getNotes?.()||[]).filter(n=>n.lane!==app.stylePreviewLaneId);
    const engine=makeEngine(app);
    const events=notes.map(n=>({pitch:n.pitch,start:n.start,dur:Math.max(0.05,(n.end-n.start)),vel:n.vel??90}));
    render(events,engine); app.transportStart?.();
  }

  window.PerformanceLayer={ updateStylePreview, commitStyleToRoll, playStylePreview, playRoll };
})();
