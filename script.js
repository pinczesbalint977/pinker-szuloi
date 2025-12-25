// Service worker regisztrálása
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker aktív ✅'))
    .catch(err => console.log('Service Worker hiba ❌', err));
}








(function(){

const canvas = document.getElementById('sigCanvas');
const ctx = canvas.getContext('2d');
let drawing=false;

function resizeCanvas(){
  const ratio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(ratio, ratio);
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/* ===== ALÁÍRÁS ===== */
canvas.addEventListener('pointerdown', e=>{
  drawing=true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});
canvas.addEventListener('pointermove', e=>{
  if(!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});
canvas.addEventListener('pointerup', ()=> drawing=false);
canvas.addEventListener('pointerleave', ()=> drawing=false);

/* ===== ALÁÍRÁS TÖRLÉS ===== */
document.getElementById('clearSig').onclick = ()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);
};

/* ===== RESET FUNKCIÓ ===== */
function resetForm(){
  const inputs = document.querySelectorAll('#leftColumn input');
  inputs.forEach(i=>{
    if(i.type !== 'button') i.value = '';
  });

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);
}

/* ===== PDF MENTÉS ===== */
document.getElementById('saveBtn').onclick = async ()=>{
  const blank = isCanvasBlank(canvas);
  if(blank){
    alert("Aláírás kötelező!");
    return;
  }

  const paper = document.getElementById('paper');
  const img = await html2canvas(paper,{
    scale:2,
    backgroundColor:'#fff'
  });

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    unit:'px',
    format:[img.width,img.height]
  });

  pdf.addImage(img.toDataURL(),'PNG',0,0,img.width,img.height);
  
  const szuloNev = document.getElementById('szulo_nev').value.trim();
const gyermekNev = document.getElementById('gyermek_nev').value.trim();

if(!szuloNev){
  alert("A szülő neve kötelező!");
  return;
}

// fájlnév tisztítása
function safe(str){
  return str
    .toLowerCase()
    .replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i')
    .replace(/ó|ö|ő/g,'o').replace(/ú|ü|ű/g,'u')
    .replace(/[^a-z0-9]/g,'_');
}

let fileName = `Szulo_beleegyezo_${safe(szuloNev)}`;

if(gyermekNev){
  fileName += `_gyermek_${safe(gyermekNev)}`;
}

fileName += '.pdf';

pdf.save(fileName);


  document.getElementById('modal').classList.add('show');
};

/* ===== MODAL OK → RESET ===== */
document.getElementById('modalClose').onclick = ()=>{
  document.getElementById('modal').classList.remove('show');
  resetForm();
};

/* ===== CANVAS ÜRESSÉG ELLENŐRZÉS ===== */
function isCanvasBlank(c){
  const blank = document.createElement('canvas');
  blank.width = c.width;
  blank.height = c.height;
  const bctx = blank.getContext('2d');
  bctx.fillStyle = '#fff';
  bctx.fillRect(0,0,blank.width,blank.height);
  return c.toDataURL() === blank.toDataURL();
}

})();
