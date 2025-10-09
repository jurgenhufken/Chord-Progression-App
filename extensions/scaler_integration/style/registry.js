const _styles=new Map();
export function registerStyle(id,mod){ _styles.set(id,mod); }
export function getStyle(id){ return _styles.get(id); }
export function listStyles(){ return Array.from(_styles.keys()); }
