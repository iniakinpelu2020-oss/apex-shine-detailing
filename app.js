/* Apex Shine Auto Detailing — engine */
const CFG = {
  name: "Apex Shine Auto Detailing",
  town: "Austin, TX",
  phone: "+15126389142",
  mode: "us"
};

const SERVICES = [
  { name:"Full Mobile Detail", cat:"Full detail", price:195, time:"≈ 4–5 hrs on site",
    desc:"The whole car, inside and out: foam wash and hand dry, wheels and tyres dressed, clay bar and sealant on the paint, then a full interior vacuum, wipe-down, glass and door jambs. Done in your driveway.",
    img:"1605559424843-9e4c228bf1c2" },
  { name:"Interior Deep Clean & Shampoo", cat:"Interior", price:145, time:"≈ 3 hrs on site",
    desc:"Seats and carpets shampooed and extracted, headliner and vents cleaned, every crevice brushed out, plastics conditioned and glass polished streak-free. The reset for work trucks, kid haulers and dog cars.",
    img:"1607860108855-64acf2078ed9" },
  { name:"Express Wash & Wax", cat:"Exterior", price:95, time:"≈ 90 min on site",
    desc:"Two-bucket hand wash, wheels and arches cleaned, bug and tar spots lifted, spray wax for gloss and water beading, tyres dressed. A quick reset before a trip, a sale or a photo.",
    img:"1583121274602-3e2820c69888" },
  { name:"Paint Correction & Ceramic Coating", cat:"Paint", price:375, time:"≈ 6–8 hrs on site",
    desc:"Machine polish to cut swirls and light scratches, panels decontaminated, then a ceramic layer cured on for months of gloss and easier washes. Quoted flat after we see the paint in person.",
    img:"1605515298946-d062f2e9da53" },
  { name:"Headlight Restoration & Trim Refresh", cat:"Exterior", price:60, time:"≈ 60 min on site",
    desc:"Oxidised headlights wet-sanded and polished back to clear, then sealed against yellowing. Faded black trim and plastics re-dyed so the car stops looking older than it is.",
    img:"1590362891991-f776e747a588" }
];

const SIZE = [
  { label:"Sedan / coupe", note:"standard", add:0 },
  { label:"Mid-size SUV / truck", note:"+$35", add:35 },
  { label:"Full-size SUV / 3-row", note:"+$65", add:65 }
];
const COND = [
  { label:"Maintained", note:"regular care", add:0 },
  { label:"Needs detail", note:"+$40", add:40 },
  { label:"Heavy build-up", note:"+$75", add:75 }
];
const SCHED = [
  { label:"Standard week", note:"this week", add:0 },
  { label:"Next-day", note:"priority", add:25 },
  { label:"Saturday", note:"weekend slot", add:35 }
];

const $ = (s) => document.querySelector(s);
const money = (n) => "$" + n;
const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* marquee */
(function ticker(){
  const bits = ["Mobile detailing","We bring water & power","64 five-star reviews","South & North Austin","No travel fees"];
  const one = bits.map(b => "<span>" + b + " <b>◆</b></span>").join("");
  $("#ticker").innerHTML = one + one;
})();

/* printed rates */
(function sheet(){
  $("#pricelist").innerHTML = SERVICES.map(s =>
    '<li><div><span class="nm">' + s.name + '</span><span class="sub-l">' + s.cat + ' · ' + s.time + '</span></div>' +
    '<span class="grow"></span><span class="pr">From $' + s.price + '</span></li>'
  ).join("");
})();

/* hours + year */
(function hours(){
  const today = new Date().toLocaleDateString("en-US",{weekday:"short",timeZone:"America/Chicago"});
  document.querySelectorAll("#hoursList li").forEach(li => { if(li.dataset.day === today) li.classList.add("today"); });
  $("#yr").textContent = new Date().getFullYear();
})();

/* 3D before/after compare */
(function compare(){
  const cmp = $("#cmp");
  if(!cmp) return;
  const set = (pct) => {
    const p = Math.max(6, Math.min(94, pct));
    cmp.style.setProperty("--split", p + "%");
  };
  let on = false;
  const fromEvent = (e) => {
    const r = cmp.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  };
  cmp.addEventListener("pointerdown", e => { on = true; fromEvent(e); cmp.setPointerCapture?.(e.pointerId); });
  cmp.addEventListener("pointermove", e => { if(on) fromEvent(e); });
  ["pointerup","pointercancel","pointerleave"].forEach(ev => cmp.addEventListener(ev, () => { on = false; }));
  cmp.addEventListener("click", e => { if(!on) fromEvent(e); });
})();

/* 3D service rack (coverflow) */
const stage = $("#rackStage"), inner = $("#rackInner"), dotsEl = $("#dots"), catsEl = $("#cats");
const cats = ["All", ...Array.from(new Set(SERVICES.map(s => s.cat)))];
let filter = "All";
let list = SERVICES.slice();
let idx = 0;
let cards = [];

function gap(){ return Math.min(stage.clientWidth * 0.32, 250); }

function buildCats(){
  catsEl.innerHTML = cats.map(c => '<button class="pill" type="button" data-cat="' + c + '">' + c + '</button>').join("");
  catsEl.querySelectorAll(".pill").forEach(p => {
    p.setAttribute("aria-pressed", String(p.dataset.cat === filter));
    p.addEventListener("click", () => {
      filter = p.dataset.cat;
      list = filter === "All" ? SERVICES.slice() : SERVICES.filter(s => s.cat === filter);
      idx = 0;
      buildCards(); buildCats(); paint(); buildDots();
    });
  });
}

function buildCards(){
  inner.innerHTML = "";
  cards = list.map((s, i) => {
    const el = document.createElement("article");
    el.className = "rcard";
    el.tabIndex = 0;
    el.setAttribute("role","button");
    el.setAttribute("aria-label", s.name);
    el.innerHTML = '<img src="https://images.unsplash.com/photo-' + s.img + '?auto=format&fit=crop&w=640&q=72" alt="' + s.name + '" loading="lazy" onerror="this.style.opacity=.25">' +
      '<div class="cap"><span class="no">' + String(i+1).padStart(2,"0") + " / " + s.cat + '</span>' +
      '<h3>' + s.name + '</h3><span class="pr">From $' + s.price + '</span></div>';
    el.addEventListener("keydown", e => {
      if(e.key === "Enter" || e.key === " "){ e.preventDefault(); openService(i); }
    });
    inner.appendChild(el);
    return el;
  });
}

function paint(){
  const g = gap();
  cards.forEach((el, i) => {
    const off = i - idx;
    const abs = Math.abs(off);
    const depth = Math.min(abs, 3);
    el.style.transform =
      "translateX(" + (off * g) + "px) " +
      "translateZ(" + (-depth * 150) + "px) " +
      "rotateY(" + (-off * 26) + "deg) scale(" + (1 - depth * 0.045) + ")";
    el.style.zIndex = String(80 - abs);
    el.style.opacity = abs > 2 ? "0" : String(Math.max(.28, 1 - abs * 0.34));
    el.style.pointerEvents = abs > 2 ? "none" : "auto";
    el.classList.toggle("on", i === idx);
    el.setAttribute("aria-current", String(i === idx));
  });
  syncDots();
}

function buildDots(){
  dotsEl.innerHTML = list.map((_, i) => '<button class="dot" type="button" aria-label="Service ' + (i+1) + '"></button>').join("");
  dotsEl.querySelectorAll(".dot").forEach((d, i) => d.addEventListener("click", () => jump(i)));
}

function syncDots(){
  dotsEl.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("on", i === idx));
}

function jump(n){
  idx = Math.max(0, Math.min(list.length - 1, n));
  paint();
}

$("#prev").addEventListener("click", () => jump(idx - 1));
$("#next").addEventListener("click", () => jump(idx + 1));

/* drag / swipe */
let down = false, startX = 0, shift = 0, dragged = 0;
stage.addEventListener("pointerdown", e => {
  down = true; startX = e.clientX; shift = 0; dragged = 0;
  stage.style.cursor = "grabbing";
});
window.addEventListener("pointermove", e => {
  if(!down) return;
  shift = e.clientX - startX;
  dragged = Math.abs(shift);
  inner.style.transform = "translateX(" + (shift * 0.42) + "px)";
});
window.addEventListener("pointerup", e => {
  if(!down) return;
  down = false;
  stage.style.cursor = "";
  inner.style.transition = "transform .3s ease";
  inner.style.transform = "translateX(0)";
  setTimeout(() => { inner.style.transition = ""; }, 320);
  if(dragged > 12){
    const steps = Math.round(-shift / gap());
    jump(idx + (steps || (shift < 0 ? 1 : -1)));
  } else {
    const hit = e.target.closest(".rcard");
    if(hit){
      const i = cards.indexOf(hit);
      if(i === idx) openService(i);
      else if(i > -1) jump(i);
    }
  }
  shift = 0; dragged = 0;
});
stage.addEventListener("pointercancel", () => {
  down = false; inner.style.transition = ""; inner.style.transform = "translateX(0)";
});
window.addEventListener("resize", paint);

/* hero compare parallax */
(function tilt(){
  const wrap = $("#cmpWrap"), box = $("#cmp");
  if(!wrap || reduce()) return;
  wrap.addEventListener("pointermove", e => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    box.style.transform = "rotateY(" + (-9 + x * 13) + "deg) rotateX(" + (4 - y * 9) + "deg)";
  });
  wrap.addEventListener("pointerleave", () => {
    box.style.transform = "rotateY(-9deg) rotateX(4deg)";
  });
})();

/* configurator */
let current = 0;
let opts = { size:0, cond:0, sched:0 };

function optRow(el, data, key){
  el.innerHTML = data.map((o,i) => '<button class="opt" type="button" data-i="' + i + '">' + o.label + '<small>' + o.note + '</small></button>').join("");
  el.querySelectorAll(".opt").forEach(b => {
    b.classList.toggle("on", Number(b.dataset.i) === opts[key]);
    b.addEventListener("click", () => {
      opts[key] = Number(b.dataset.i);
      el.querySelectorAll(".opt").forEach(x => x.classList.toggle("on", x === b));
      price();
    });
  });
}

function price(){
  const s = list[current];
  if(!s) return 0;
  const total = s.price + SIZE[opts.size].add + COND[opts.cond].add + SCHED[opts.sched].add;
  $("#livePrice").textContent = money(total);
  return total;
}

function openService(i){
  if(i < 0 || !list[i]) return;
  current = i;
  const s = list[i];
  opts = { size:0, cond:0, sched:0 };
  $("#cfgImg").src = "https://images.unsplash.com/photo-" + s.img + "?auto=format&fit=crop&w=1000&q=78";
  $("#cfgImg").alt = s.name;
  $("#cfgCat").textContent = s.cat;
  $("#cfgIndex").textContent = "02 / " + s.cat;
  $("#cfgName").textContent = s.name;
  $("#cfgDesc").textContent = s.desc;
  $("#cfgTime").textContent = s.time;
  $("#cfgTown").textContent = CFG.town;
  optRow($("#optSize"), SIZE, "size");
  optRow($("#optCond"), COND, "cond");
  optRow($("#optSched"), SCHED, "sched");
  price();
  document.body.classList.add("detail-view");
  $("#detail").classList.add("on");
  buildMore(i);
  window.scrollTo({ top:0, behavior:"auto" });
}

function buildMore(i){
  const others = list.filter((_, n) => n !== i).slice(0,3);
  $("#moreGrid").innerHTML = "";
  others.forEach(s => {
    const b = document.createElement("button");
    b.className = "mcard"; b.type = "button";
    b.innerHTML = '<img src="https://images.unsplash.com/photo-' + s.img + '?auto=format&fit=crop&w=200&q=65" alt="">' +
      "<div><b>" + s.name + "</b><i>From $" + s.price + "</i></div>";
    b.addEventListener("click", () => openService(list.findIndex(x => x.name === s.name)));
    $("#moreGrid").appendChild(b);
  });
}

$("#backBtn").addEventListener("click", () => {
  document.body.classList.remove("detail-view");
  $("#detail").classList.remove("on");
  window.scrollTo({ top:0, behavior:"auto" });
});

/* estimate drawer */
let cart = [];

function openDrawer(){ $("#drawer").classList.add("on"); $("#drawer").setAttribute("aria-hidden","false"); $("#scrim").classList.add("on"); }
function closeDrawer(){ $("#drawer").classList.remove("on"); $("#drawer").setAttribute("aria-hidden","true"); $("#scrim").classList.remove("on"); }

function paintCart(){
  const body = $("#drawerBody");
  if(!cart.length){
    body.innerHTML = '<p class="empty">Nothing added yet. Drag the rack, open a detail and build your estimate.</p>';
  } else {
    body.innerHTML = cart.map((c,i) =>
      '<div class="line"><div><b>' + c.name + '</b><span>' + c.detail + '</span>' +
      '<button class="rm" type="button" data-i="' + i + '">remove</button></div>' +
      '<div class="amt">' + money(c.price) + '</div></div>'
    ).join("");
    body.querySelectorAll(".rm").forEach(b => b.addEventListener("click", () => { cart.splice(Number(b.dataset.i),1); paintCart(); count(); }));
  }
  const total = cart.reduce((a,c) => a + c.price, 0);
  $("#total").textContent = money(total);
  const msg = "Hi " + CFG.name + ", I'd like to book: " +
    (cart.length ? cart.map(c => c.name + " (" + c.detail + ")").join("; ") + ". Estimate " + money(total) + "." : "a detail.");
  $("#textBtn").href = CFG.mode === "ng"
    ? "https://wa.me/" + CFG.phone.replace("+","") + "?text=" + encodeURIComponent(msg)
    : "sms:" + CFG.phone + "?&body=" + encodeURIComponent(msg);
}

function count(){
  const n = cart.length;
  ["#cartCount","#cartCount2"].forEach(sel => {
    const el = $(sel); if(!el) return;
    el.textContent = n; el.classList.toggle("on", n > 0);
  });
}

$("#addBtn").addEventListener("click", () => {
  const s = list[current];
  if(!s) return;
  const total = price();
  cart.push({ name:s.name, price:total, detail:SIZE[opts.size].label + " · " + COND[opts.cond].label + " · " + SCHED[opts.sched].label });
  paintCart(); count();
  const t = $("#toast"); t.classList.add("on"); setTimeout(() => t.classList.remove("on"), 1900);
  openDrawer();
});

["#openEstimate","#openEstimate2","#openEstimate3"].forEach(sel => {
  const el = $(sel); if(el) el.addEventListener("click", openDrawer);
});
$("#closeDrawer").addEventListener("click", closeDrawer);
$("#scrim").addEventListener("click", closeDrawer);
document.addEventListener("keydown", e => { if(e.key === "Escape") closeDrawer(); });

/* boot removal failsafe */
setTimeout(() => { const b = document.getElementById("boot"); if(b) b.remove(); }, 2600);

/* boot */
buildCats(); buildCards(); paint(); buildDots(); paintCart(); count();
