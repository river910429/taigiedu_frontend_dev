// Simple shared resource store with pub-sub
const subscribers = new Set();

let resources = [];

export function setResources(list) {
  resources = Array.isArray(list) ? list.slice() : [];
  notify();
}

export function getResources() {
  return resources.slice();
}

export function updateResource(id, patch) {
  let changed = false;
  resources = resources.map(r => {
    if (r.id === id) {
      changed = true;
      return { ...r, ...patch };
    }
    return r;
  });
  if (changed) notify();
}

export function removeResource(id) {
  const before = resources.length;
  resources = resources.filter(r => r.id !== id);
  if (resources.length !== before) notify();
}

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function notify() {
  subscribers.forEach(fn => {
    try { fn(resources); } catch {}
  });
}

// Helper: mark resource as down (下架)
export function downResource(id, reason) {
  updateResource(id, { status: '下架', downReason: reason });
}
