import { AppAdapter } from '../adapters/app-adapter.js';
export function makeEngine(app){
  const a=app instanceof AppAdapter?app:new AppAdapter(app);
  return { on:(p,v,t)=>a.scheduleNoteOn(p,v,t), off:(p,t)=>a.scheduleNoteOff(p,t) };
}
