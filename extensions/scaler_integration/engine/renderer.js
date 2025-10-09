export function render(events,engine){
  for(const e of events){
    engine.on(e.pitch,e.vel??90,e.start);
    engine.off(e.pitch,e.start+(e.dur??0.5));
  }
}
