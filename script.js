const colorRefs = [
  { hex: "#421A25", rgb:[66,26,37], status: "Sangat Layak", price: 25000 },
  { hex: "#5F1B12", rgb:[95,27,18], status: "Masih Layak", price: 17500 },
  { hex: "#6B280E", rgb:[107,40,14], status: "Masih Layak", price: 15000 },
  { hex: "#7D3215", rgb:[125,50,21], status: "Tidak Layak", price: 0 },
  { hex: "#481F22", rgb:[72,31,34], status: "Tidak Layak", price: 0 },
  { hex: "#441518", rgb:[68,21,24], status: "Tidak Layak", price: 0 },
  { hex: "#560D14", rgb:[86,13,20], status: "Tidak Layak", price: 0 }
];

function hexToRgb(hex){ let v=parseInt(hex.slice(1),16); return [(v>>16)&255,(v>>8)&255,v&255]; }
function rgbToString(rgb){ return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`; }
function distance(c1,c2){ return Math.sqrt((c1[0]-c2[0])**2+(c1[1]-c2[1])**2+(c1[2]-c2[2])**2); }
function formatRp(n){ return n>0? 'Rp '+n.toLocaleString('id-ID'):'Tidak Dijual'; }

const startCam = document.getElementById('startCam');
const snapBtn = document.getElementById('snapBtn');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPreview = document.getElementById('colorPreview');
const scanStatus = document.getElementById('scanStatus');
const scanQuality = document.getElementById('scanQuality');
const scanPrice = document.getElementById('scanPrice');
const statQuality = document.getElementById('statQuality');
const statPrice = document.getElementById('statPrice');
const statLastScan = document.getElementById('statLastScan');
const refTableBody = document.querySelector('#refTable tbody');
const clearBtn = document.getElementById('clearBtn');
const manualHex = document.getElementById('manualHex');
const applyManual = document.getElementById('applyManual');

function populateRefTable(){
  refTableBody.innerHTML='';
  colorRefs.forEach((r,i)=>{
    const rgb = r.rgb || hexToRgb(r.hex);
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${i+1}</td><td><code>${r.hex}</code></td><td>${rgb.join(', ')}</td><td>${r.status}</td><td>${formatRp(r.price)}</td>`;
    refTableBody.appendChild(tr);
  });
}
populateRefTable();

// Kamera
let stream;
startCam.addEventListener('click', async ()=>{
  try{
    stream = await navigator.mediaDevices.getUserMedia({video:true});
    video.srcObject = stream;
    video.style.display='block';
    snapBtn.style.display='inline-block';
  }catch(err){ alert('Kamera tidak bisa diakses: '+err); }
});

snapBtn.addEventListener('click', ()=>{
  if(!video.videoWidth) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video,0,0);
  const imgd = ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let r=0,g=0,b=0,count=0;
  for(let i=0;i<imgd.length;i+=4){
    const alpha = imgd[i+3];
    if(alpha===0) continue;
    r+=imgd[i]; g+=imgd[i+1]; b+=imgd[i+2]; count++;
  }
  if(count===0) return;
  r=Math.round(r/count); g=Math.round(g/count); b=Math.round(b/count);
  processScan([r,g,b]);
});

applyManual.addEventListener('click', ()=>{
  let hex = manualHex.value.trim();
  if(!hex.startsWith('#')) hex='#'+hex;
  try{ processScan(hexToRgb(hex), true); }catch(e){ alert('HEX tidak valid'); }
});

clearBtn.addEventListener('click', ()=>{
  colorPreview.style.background='transparent';
  scanStatus.textContent='Belum ada hasil scan';
  scanQuality.textContent='';
  scanPrice.textContent='';
  statQuality.textContent='-';
  statPrice.textContent='-';
  statLastScan.textContent='-';
});

function processScan(rgb){
  colorPreview.style.background = rgbToString(rgb);
  scanStatus.textContent = `Warna terdeteksi: ${rgbToString(rgb)}`;
  let best=null,bestDist=1e9;
  colorRefs.forEach(r=>{
    const refRgb=r.rgb||hexToRgb(r.hex);
    const d=distance(rgb,refRgb);
    if(d<bestDist){ bestDist=d; best=r; }
  });
  scanQuality.textContent=`Kualitas: ${best.status}`;
  scanPrice.textContent=`Harga: ${formatRp(best.price)}`;
  statQuality.textContent=best.status;
  statPrice.textContent=formatRp(best.price);
  statLastScan.textContent=new Date().toLocaleString('id-ID');
}