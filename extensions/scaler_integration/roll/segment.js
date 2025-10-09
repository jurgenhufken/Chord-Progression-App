export function groupByBars(notes, beatsPerBar=4){
  const m = new Map();
  for (const n of notes){
    const b = Math.floor(n.start / beatsPerBar);
    if (!m.has(b)) m.set(b, []);
    m.get(b).push(n);
  }
  return m;
}
export function pitchClasses(notes){
  const set = new Set(); let lowest = null;
  for (const n of notes){
    const pc = ((n.pitch%12)+12)%12;
    set.add(pc);
    if (lowest==null || n.pitch<lowest) lowest = n.pitch;
  }
  return { pcs: [...set].sort((a,b)=>a-b), bassPC: lowest!=null ? ((lowest%12)+12)%12 : null };
}
