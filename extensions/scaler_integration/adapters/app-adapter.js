/**
 * AppAdapter - glue between your existing app.js and the performance layer.
 */
export class AppAdapter {
  constructor(app = {}){
    this._app = app;
    this.lengthBars = app.lengthBars ?? 8;
    this.loop = app.loop ?? { startBar: 1, endBar: this.lengthBars };
    this.stylePreview = [];
    this.stylePreviewLaneId = "__preview__";
  }
  getNotes(){ return this._app.getNotes ? this._app.getNotes() : []; }
  getTempo(){ return this._app.getTempo ? this._app.getTempo() : 120; }
  beatsPerBar(){ return 4; }
  scheduleNoteOn(p,v,t){ return this._app.scheduleNoteOn?.(p,v,t); }
  scheduleNoteOff(p,t){ return this._app.scheduleNoteOff?.(p,t); }
  addNotesToRoll(ns){ return this._app.addNotesToRoll?.(ns); }
  addLane(id,name){ return this._app.addLane?.(id,name); }
  redrawPianoRoll(){ return this._app.redrawPianoRoll?.(); }
  refreshRollUI(){ return this._app.refreshRollUI?.(); }
  drawPreviewOverlay(ev){ return this._app.drawPreviewOverlay?.(ev); }
  clearPreviewOverlay(){ return this._app.clearPreviewOverlay?.(); }
  transportStart(){ return this._app.transportStart?.(); }
  transportStop(){ return this._app.transportStop?.(); }
  killAllVoices(){ return this._app.killAllVoices?.(); }
  setLengthBars(b){
    this.lengthBars = Math.max(1, Math.floor(b));
    if (!this.loop) this.loop = { startBar: 1, endBar: this.lengthBars };
    this.loop.startBar = Math.min(this.loop.startBar, this.lengthBars);
    this.loop.endBar   = Math.min(Math.max(this.loop.endBar, this.loop.startBar), this.lengthBars);
  }
  setLoop(s,e){
    this.loop = {
      startBar: Math.max(1, Math.min(s, this.lengthBars)),
      endBar:   Math.max(1, Math.min(e, this.lengthBars))
    };
  }
}
