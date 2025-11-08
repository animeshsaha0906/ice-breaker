const animals = ["Falcon","Panda","Otter","Hawk","Drake","Manta","Kiwi","Tiger","Lynx","Orca","Koala","Heron"];
const colors = ["Lime","Cobalt","Crimson","Amber","Teal","Indigo","Coral","Ivory","Onyx","Olive","Azure"];
export function randomHandle() {
  const a = animals[Math.floor(Math.random()*animals.length)];
  const c = colors[Math.floor(Math.random()*colors.length)];
  const n = Math.floor(Math.random()*90+10);
  return `${c}-${a}-${n}`;
}
