function go(url){ window.location.href = url; }

const startBtn = document.getElementById("startBtn");
const modal = document.getElementById("modal");
const sev = document.getElementById("severity");
const sevVal = document.getElementById("sevVal");

if (startBtn && modal) {
  startBtn.addEventListener("click", () => {
    modal.hidden = false;
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

function closeModal(){
  if (modal) modal.hidden = true;
}

if (sev && sevVal){
  sev.addEventListener("input", () => sevVal.textContent = sev.value);
}

function submitCheck(){
  const symptom = document.getElementById("symptom")?.value?.trim() || "";
  const duration = document.getElementById("duration")?.value || "";
  const severity = document.getElementById("severity")?.value || "0";

  let msg = `تم استلام: ${symptom} • المدة: ${duration} • الشدة: ${severity}/10`;
  alert(msg);
  closeModal();
}

function toast(text){
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = text;
  t.hidden = false;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=> t.hidden = true, 2200);
}

const notifBtn = document.getElementById("notifBtn");
const notifPanel = document.getElementById("notifPanel");
const notifCount = document.getElementById("notifCount");

if (notifBtn && notifPanel) {
  notifBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    notifPanel.hidden = !notifPanel.hidden;
  });

  document.addEventListener("click", () => {
    notifPanel.hidden = true;
  });
}

document.querySelector(".notifClear")?.addEventListener("click", (e) => {
  e.stopPropagation();
  document.querySelectorAll(".notifItem").forEach(n => n.classList.add("isRead"));
  if (notifCount) notifCount.textContent = "0";
  notifPanel.hidden = true;
});

let currentQty = 1;

function openProduct(el){
  document.getElementById("pmImg").src = el.dataset.img;
  document.getElementById("pmName").textContent = el.dataset.name;
  document.getElementById("pmPrice").textContent = el.dataset.price;
  document.getElementById("pmQty").textContent = "1";
  currentQty = 1;

  document.getElementById("productModal").hidden = false;
}

function closeProduct(){
  document.getElementById("productModal").hidden = true;
}

function changeQty(val){
  currentQty = Math.max(1, currentQty + val);
  document.getElementById("pmQty").textContent = currentQty;
}

function addToCart(){
  showToast("Added to cart ✔️");
  closeProduct();
}
function showToast(msg){
  let toast = document.getElementById("toastMsg");

  if(!toast){
    toast = document.createElement("div");
    toast.id = "toastMsg";
    toast.className = "toastMsg";
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}
document.getElementById("productModal")?.addEventListener("click", closeProduct);
// ===== Cart Storage =====
let cart = JSON.parse(localStorage.getItem("eiada_cart") || "[]");

function saveCart(){
  localStorage.setItem("eiada_cart", JSON.stringify(cart));
}

function cartItemsCount(){
  return cart.reduce((sum, it) => sum + it.qty, 0);
}

function cartTotal(){
  return cart.reduce((sum, it) => sum + (it.price * it.qty), 0);
}

function refreshCartUI(){
  const fab = document.getElementById("cartFab");
  const countEl = document.getElementById("cartCount");
  const listEl = document.getElementById("cartList");
  const totalEl = document.getElementById("cartTotal");

  const count = cartItemsCount();

  if(count > 0){
    fab.hidden = false;
    countEl.textContent = count;
  }else{
    fab.hidden = true;
  }

  // list
  listEl.innerHTML = "";
  cart.forEach((it, idx) => {
    const row = document.createElement("div");
    row.className = "cartRow";
    row.innerHTML = `
      <img src="${it.img}" alt="${it.name}">
      <div class="cartInfo">
        <b>${it.name}</b>
        <small>$${it.price} each</small>
      </div>
      <div class="cartQty">
        <button type="button" onclick="updateCartQty(${idx}, -1)">−</button>
        <b>${it.qty}</b>
        <button type="button" onclick="updateCartQty(${idx}, 1)">+</button>
      </div>
      <button class="removeBtn" type="button" onclick="removeFromCart(${idx})">🗑️</button>
    `;
    listEl.appendChild(row);
  });

  totalEl.textContent = cartTotal().toFixed(2);
}

function addItemToCart(item){
  const existing = cart.find(x => x.name === item.name);
  if(existing){
    existing.qty += item.qty;
  }else{
    cart.push(item);
  }
  saveCart();
  refreshCartUI();
}

function updateCartQty(index, delta){
  cart[index].qty += delta;
  if(cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  refreshCartUI();
}

function removeFromCart(index){
  cart.splice(index, 1);
  saveCart();
  refreshCartUI();
}

// ===== Cart Modal =====
function openCart(){
  document.getElementById("cartModal").hidden = false;
}
function closeCart(){
  document.getElementById("cartModal").hidden = true;
}

function checkout(){
  if(cart.length === 0) return;
  showToast("Checkout ✅");
  cart = [];
  saveCart();
  refreshCartUI();
  closeCart();
}

// ===== Hook into your addToCart =====
// لازم تخلي هذي المتغيرات موجودة عندك من Modal المنتج:
function addToCart(){
  const name = document.getElementById("pmName").textContent;
  const price = parseFloat(document.getElementById("pmPrice").textContent);
  const img = document.getElementById("pmImg").src;
  const qty = currentQty || 1;

  addItemToCart({ name, price, img, qty });
  showToast("Added to cart ✔️");
  closeProduct();
}

const docTrack = document.getElementById("docTrack");
const docLeft  = document.getElementById("docLeft");
const docRight = document.getElementById("docRight");

const STEP = 220;

/* كشف نوع RTL scrollLeft بالمتصفح */
function getRtlType(el){
  el.scrollLeft = 1;
  if (el.scrollLeft === 0) return "reverse"; // Chrome/Edge
  el.scrollLeft = -1;
  if (el.scrollLeft < 0) return "negative";  // Firefox
  return "default";                          // Safari (غالباً)
}

function getNormScrollLeft(el, rtlType){
  const max = el.scrollWidth - el.clientWidth;
  const sl = el.scrollLeft;

  if (document.dir !== "rtl") return sl;

  if (rtlType === "negative") return Math.abs(sl);      // 0..max
  if (rtlType === "reverse")  return max - sl;          // 0..max
  return sl;                                            // default
}

function scrollByNorm(el, rtlType, delta){
  // delta (+) يعني نروح “للأمام” بالسلايدر، (-) يعني نرجع
  if (document.dir !== "rtl"){
    el.scrollBy({ left: delta, behavior: "smooth" });
    return;
  }

  // بالـRTL نعكس حسب النوع
  if (rtlType === "negative") el.scrollBy({ left: -delta, behavior: "smooth" });
  else if (rtlType === "reverse") el.scrollBy({ left: delta, behavior: "smooth" });
  else el.scrollBy({ left: delta, behavior: "smooth" });
}

function updateDocArrows(el, rtlType){
  const max = el.scrollWidth - el.clientWidth;
  const nsl = getNormScrollLeft(el, rtlType);

  // بالبداية: يظهر سهم واحد فقط (مثل ما تريد)
  if (nsl <= 5){
    docLeft.hidden  = false;
    docRight.hidden = true;
  }
  // بالنهاية
  else if (nsl >= max - 5){
    docLeft.hidden  = true;
    docRight.hidden = false;
  }
  // بالنص
  else{
    docLeft.hidden  = false;
    docRight.hidden = false;
  }
}

if (docTrack && docLeft && docRight){
  const rtlType = getRtlType(docTrack);

  docLeft.addEventListener("click", () => {
    scrollByNorm(docTrack, rtlType, -STEP);
  });

  docRight.addEventListener("click", () => {
    scrollByNorm(docTrack, rtlType, STEP);
  });

  docTrack.addEventListener("scroll", () => updateDocArrows(docTrack, rtlType));

  // أول ما تفتح الصفحة
  updateDocArrows(docTrack, rtlType);
}
const offersSlider = document.getElementById("offersSlider");
const offLeft  = document.getElementById("offLeft");
const offRight = document.getElementById("offRight");

const OFF_STEP = 320;

/* نفس دوال RTL المستخدمة قبل */
function getRtlType(el){
  el.scrollLeft = 1;
  if (el.scrollLeft === 0) return "reverse";
  el.scrollLeft = -1;
  if (el.scrollLeft < 0) return "negative";
  return "default";
}

function getNormScrollLeft(el, rtlType){
  const max = el.scrollWidth - el.clientWidth;
  const sl = el.scrollLeft;

  if (document.dir !== "rtl") return sl;

  if (rtlType === "negative") return Math.abs(sl);
  if (rtlType === "reverse")  return max - sl;
  return sl;
}

function scrollByNorm(el, rtlType, delta){
  if (document.dir !== "rtl"){
    el.scrollBy({ left: delta, behavior: "smooth" });
    return;
  }
  if (rtlType === "negative") el.scrollBy({ left: -delta, behavior: "smooth" });
  else if (rtlType === "reverse") el.scrollBy({ left: delta, behavior: "smooth" });
  else el.scrollBy({ left: delta, behavior: "smooth" });
}

function updateOfferArrows(el, rtlType){
  const max = el.scrollWidth - el.clientWidth;
  const nsl = getNormScrollLeft(el, rtlType);

  if (nsl <= 5){
    offLeft.hidden  = false;
    offRight.hidden = true;
  } else if (nsl >= max - 5){
    offLeft.hidden  = true;
    offRight.hidden = false;
  } else {
    offLeft.hidden  = false;
    offRight.hidden = false;
  }
}

if (offersSlider && offLeft && offRight){
  const rtlTypeOff = getRtlType(offersSlider);

  offLeft.addEventListener("click", () => {
    scrollByNorm(offersSlider, rtlTypeOff, -OFF_STEP);
  });

  offRight.addEventListener("click", () => {
    scrollByNorm(offersSlider, rtlTypeOff, OFF_STEP);
  });

  offersSlider.addEventListener("scroll", () => updateOfferArrows(offersSlider, rtlTypeOff));
  updateOfferArrows(offersSlider, rtlTypeOff);
}
// ===== Quick Consultation Wizard =====
let qcStep = 1;
let qcSym = null;
let qcAnswers = { fever: null, breath: null };
let qcBundle = [];

function openQC(){
  document.getElementById("qcModal").hidden = false;
  qcGo(1);
}
function closeQC(){
  document.getElementById("qcModal").hidden = true;
}

function qcGo(step){
  qcStep = step;

  // steps show/hide
  document.getElementById("qcStep1").hidden = step !== 1;
  document.getElementById("qcStep2").hidden = step !== 2;
  document.getElementById("qcStep3").hidden = step !== 3;

  // buttons
  document.getElementById("qcBackBtn").hidden = step === 1;
  document.getElementById("qcNextBtn").textContent = (step === 3) ? "Done" : "Next";

  // progress
  const pct = step === 1 ? 33 : step === 2 ? 66 : 100;
  setRing(pct);
  document.getElementById("qcRingText").textContent = pct + "%";
  document.getElementById("qcStepLabel").textContent = `Step ${step} of 3`;

  // tips
  const tips = document.getElementById("qcTips");
  if(step === 1) tips.textContent = "اختار عرض واحد حتى نكمل.";
  if(step === 2) tips.textContent = "حدد الشدة وجاوب نعم/لا.";
  if(step === 3) tips.textContent = "هاي نتيجة أولية + باندل مقترح.";
}

function setRing(percent){
  const small = document.querySelector(".qcRing .ring");
  const big   = document.querySelector(".qcRingBig .ringBig");
  if(small) small.style.background = `conic-gradient(#2aa7b3 ${percent*3.6}deg, rgba(0,0,0,.08) 0deg)`;
  if(big)   big.style.background   = `conic-gradient(#2aa7b3 ${percent*3.6}deg, rgba(0,0,0,.08) 0deg)`;
  const pctEl = document.getElementById("qcPct");
  if(pctEl) pctEl.textContent = percent + "%";
}

function qcNext(){
if(qcStep === 1){
  if(!qcSym){ showToast?.("Choose a symptom first ⚠️"); return; }
  renderQCQuestions();   // ✅ يولّد أسئلة Step2 حسب الحالة
  qcGo(2);
  return;
}
if(qcStep === 2){
  const needed = (QC_QUESTIONS[qcSym] || []).map(q => q.key);
  const ok = needed.every(k => qcAnswers[k] === "yes" || qcAnswers[k] === "no");
  if(!ok){ showToast?.("Answer all questions ⚠️"); return; }

  buildResultAndBundle();
  qcGo(3);
  return;
}
  // Done
  closeQC();
}

function qcPrev(){
  qcGo(Math.max(1, qcStep - 1));
}

// chips selection
document.getElementById("qcChips")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if(!btn) return;
  qcSym = btn.dataset.sym;
  document.querySelectorAll(".chip").forEach(x => x.classList.remove("isActive"));
  btn.classList.add("isActive");
});

// severity
document.getElementById("qcSev")?.addEventListener("input", (e) => {
  document.getElementById("qcSevVal").textContent = e.target.value;
});

// yes/no
document.querySelectorAll(".yn")?.forEach(b => {
  b.addEventListener("click", () => {
    const q = b.dataset.q;
    const a = b.dataset.a;

    // reset same question
    document.querySelectorAll(`.yn[data-q="${q}"]`).forEach(x => x.classList.remove("isActive"));
    b.classList.add("isActive");
    qcAnswers[q] = a;
  });
});

function buildResultAndBundle(){
  const sev = parseInt(document.getElementById("qcSev").value, 10);

  let msg = "";
  if(qcAnswers.breath === "yes"){
    msg += "⚠️ إذا عندك ضيق نفس/ألم صدر: الأفضل تراجع طوارئ/طبيب فوراً.\n\n";
  }
  if(sev >= 8){
    msg += "🔴 الشدة عالية (8+). إذا الأعراض مستمرة أو تتفاقم، راجع طبيب.\n\n";
  } else if(sev >= 5){
    msg += "🟠 الشدة متوسطة. راحة + سوائل + راقب الأعراض.\n\n";
  } else {
    msg += "🟢 الشدة خفيفة. متابعة بسيطة غالباً تكفي.\n\n";
  }

  if(qcSym === "cold") msg += "اقتراح عام للزكام: سوائل دافية + راحة.\n";
  if(qcSym === "headache") msg += "للصداع: قلل شاشة/إجهاد + سوائل.\n";
  if(qcSym === "skin") msg += "للبشرة: تجنب المهيجات + ترطيب.\n";
  if(qcSym === "eyes") msg += "للعيون: تجنب فرك العين + راحة.\n";

  document.getElementById("qcResult").textContent = msg;

  // bundle mapping (على منتجاتك p1..p20)
  const bundles = {
    cold: [
      { name:"Cold Relief", price:9, img:"images/p19.jpg", qty:1 },
      { name:"Vitamin C",  price:12, img:"images/p1.jpg",  qty:1 }
    ],
    headache: [
      { name:"Pain Relief", price:7,  img:"images/p3.jpg",  qty:1 },
      { name:"Pain Gel",    price:11, img:"images/p16.jpg", qty:1 }
    ],
    skin: [
      { name:"Skin Care",   price:15, img:"images/p4.jpg",  qty:1 },
      { name:"Skin Lotion", price:13, img:"images/p17.jpg", qty:1 }
    ],
    eyes: [
      { name:"Eye Drops",     price:4,  img:"images/p10.jpg", qty:1 },
      { name:"Face Cleanser", price:9,  img:"images/p2.jpg",  qty:1 }
    ]
  };

  qcBundle = bundles[qcSym] || [];
  renderBundle();
}

function renderBundle(){
  const wrap = document.getElementById("bundleList");
  wrap.innerHTML = "";
  qcBundle.forEach(it => {
    const div = document.createElement("div");
    div.className = "bundleItem";
    div.innerHTML = `
      <img src="${it.img}" alt="${it.name}">
      <div>
        ${it.name}
        <small>$${it.price}</small>
      </div>
    `;
    wrap.appendChild(div);
  });
}

function addBundleToCart(){
  if(!qcBundle.length){ showToast?.("No bundle to add"); return; }

  // اذا عندك نظام السلة (addItemToCart) يشتغل تلقائي
  if(typeof addItemToCart === "function"){
    qcBundle.forEach(it => addItemToCart({ ...it }));
    refreshCartUI?.();
    showToast?.("Bundle added ✔️");
  }else{
    // fallback اذا بعد ما مفعّل السلة
    showToast?.("Cart system not found ⚠️");
  }
}
window.addEventListener("DOMContentLoaded", () => {

  // chips selection
  const chips = document.getElementById("qcChips");
  if (chips){
    chips.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if(!btn) return;
      qcSym = btn.dataset.sym;
      chips.querySelectorAll(".chip").forEach(x => x.classList.remove("isActive"));
      btn.classList.add("isActive");
    });
  }

  // severity
  const sev = document.getElementById("qcSev");
  if (sev){
    sev.addEventListener("input", (e) => {
      document.getElementById("qcSevVal").textContent = e.target.value;
    });
  }

  // yes/no
  document.querySelectorAll(".yn").forEach(b => {
    b.addEventListener("click", () => {
      const q = b.dataset.q;
      const a = b.dataset.a;
      document.querySelectorAll(`.yn[data-q="${q}"]`).forEach(x => x.classList.remove("isActive"));
      b.classList.add("isActive");
      qcAnswers[q] = a;
    });
  });

});

// أسئلة متغيرة حسب الحالة
const QC_QUESTIONS = {
  cold: [
    { key: "fever", text: "هل عندك حرارة؟", danger: false },
    { key: "cough", text: "هل السعال قوي؟", danger: false },
    { key: "breath", text: "هل عندك ضيق نفس/ألم صدر؟", danger: true }
  ],
  headache: [
    { key: "light", text: "هل الضوء يزعجك؟", danger: false },
    { key: "vomit", text: "هل عندك غثيان/تقيؤ؟", danger: false },
    { key: "neuro", text: "هل عندك خدر/ضعف مفاجئ؟", danger: true }
  ],
  skin: [
    { key: "itch", text: "هل الحكة قوية؟", danger: false },
    { key: "spread", text: "هل الانتشار سريع؟", danger: false },
    { key: "swelling", text: "هل اكو تورم بالوجه/الشفايف؟", danger: true }
  ],
  eyes: [
    { key: "red", text: "هل العين حمراء؟", danger: false },
    { key: "pain", text: "هل اكو ألم بالعين؟", danger: false },
    { key: "vision", text: "هل اكو تشوش/نقص بالرؤية؟", danger: true }
  ]
};

// نولّد الأسئلة داخل Step2 حسب qcSym
function renderQCQuestions(){
  const wrap = document.getElementById("qcQuestions");
  if(!wrap) return;

  wrap.innerHTML = "";
  qcAnswers = {}; // نفرغ أجوبة step2 كل مرة تتغير الحالة

  const list = QC_QUESTIONS[qcSym] || [];
  list.forEach(q => {
    const box = document.createElement("div");
    box.className = "qcQ";
    box.innerHTML = `
      <p>${q.text}</p>
      <div class="qcYN">
        <button type="button" class="yn ${q.danger ? "danger" : ""}" data-q="${q.key}" data-a="yes">Yes</button>
        <button type="button" class="yn" data-q="${q.key}" data-a="no">No</button>
      </div>
    `;
    wrap.appendChild(box);
  });

  // نربط أزرار Yes/No اللي تولدت الآن
  wrap.querySelectorAll(".yn").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.dataset.q;
      const a = btn.dataset.a;

      wrap.querySelectorAll(`.yn[data-q="${q}"]`).forEach(x => x.classList.remove("isActive"));
      btn.classList.add("isActive");
      qcAnswers[q] = a;
    });
  });
}
function buildResultAndBundle(){
  const sev = parseInt(document.getElementById("qcSev").value, 10);

  // مستوى الحالة حسب الشدة
  let level = "good", title = "Mild الحالة خفيفة", note = "غالباً تقدر تتابع بالبيت.";
  if(sev >= 8){ level="bad"; title="High الشدة عالية"; note="الأفضل تراجع طبيب إذا مستمرة/تتفاقم."; }
  else if(sev >= 5){ level="mid"; title="Moderate الشدة متوسطة"; note="راقب الأعراض وارتاح واشرب سوائل."; }

  // هل عدنا جواب خطر؟ (أي سؤال danger اذا yes)
  // بما أننا نخزن كل الأجوبة داخل qcAnswers، نفحص keys المعروفة حسب الحالة
  const list = QC_QUESTIONS[qcSym] || [];
  const dangerKeys = list.filter(q=>q.danger).map(q=>q.key);
  const dangerYes = dangerKeys.some(k => qcAnswers[k] === "yes");

  // نصائح حسب الحالة المختارة
  const tipsBySym = {
    cold: [
      "اشرب سوائل دافية ونام زين.",
      "إذا حرارة مستمرة أكثر من 48 ساعة راجع طبيب.",
      "ابتعد عن التدخين/الغبار قدر الإمكان."
    ],
    headache: [
      "اشرب مي وخفف كافيين.",
      "قلل إضاءة الشاشة وخذ استراحة.",
      "إذا الصداع مفاجئ وقوي جداً راجع طبيب."
    ],
    skin: [
      "تجنب الصابون القوي والعطور.",
      "استخدم مرطب بشكل منتظم.",
      "إذا اكو تورم/انتشار سريع راجع طبيب."
    ],
    eyes: [
      "تجنب فرك العين وخفف شاشة.",
      "استخدم قطرة مرطبة إذا مناسبة.",
      "إذا اكو ألم قوي/تشوش رؤية راجع طبيب."
    ]
  };

  const tips = tipsBySym[qcSym] || ["تابع الأعراض واذا تسوء، راجع طبيب."];

  // اسم الحالة لعرضها
  const symName = {
    cold: "Cold / Flu",
    headache: "Headache",
    skin: "Skin Issue",
    eyes: "Eye Irritation"
  }[qcSym] || "Consultation";

  // بناء النتيجة كـ HTML مرتب
  const res = document.getElementById("qcResult");
  res.innerHTML = `
    <div class="resCard">
      <div class="resBar ${level}">
        <div>Result: ${title}</div>
        <small>${symName} • ${sev}/10</small>
      </div>

      <div style="font-weight:800; color:#0f3b61;">${note}</div>

      <ul class="resList">
        ${tips.map(t => `<li>${t}</li>`).join("")}
      </ul>

      ${dangerYes ? `
        <div class="resWarn">
          ⚠️ عندك جواب على سؤال خطير = Yes. إذا الأعراض قوية/مستمرة، الأفضل تراجع طبيب أو طوارئ.
        </div>
      ` : ""}

      <div class="resActions">
        <button class="resGhost" type="button" onclick="closeQC()">Close</button>
        <button class="resPrimary" type="button" onclick="showToast?.('Booking ✅')">Book Doctor</button>
      </div>
    </div>
  `;

  // --- Bundle mapping يبقى نفسه (مثل ما عندك) ---
  const bundles = {
    cold: [
      { name:"Cold Relief", price:9, img:"images/p19.jpg", qty:1 },
      { name:"Vitamin C",  price:12, img:"images/p1.jpg",  qty:1 }
    ],
    headache: [
      { name:"Pain Relief", price:7,  img:"images/p3.jpg",  qty:1 },
      { name:"Pain Gel",    price:11, img:"images/p16.jpg", qty:1 }
    ],
    skin: [
      { name:"Skin Care",   price:15, img:"images/p4.jpg",  qty:1 },
      { name:"Skin Lotion", price:13, img:"images/p17.jpg", qty:1 }
    ],
    eyes: [
      { name:"Eye Drops",     price:4,  img:"images/p10.jpg", qty:1 },
      { name:"Face Cleanser", price:9,  img:"images/p2.jpg",  qty:1 }
    ]
  };
  // في ملف script.js - إذا لم تكن موجودة
function toast(message, duration = 3000) {
    const toastEl = document.getElementById('toast');
    toastEl.textContent = message;
    toastEl.hidden = false;
    
    setTimeout(() => {
        toastEl.hidden = true;
    }, duration);
}

  qcBundle = bundles[qcSym] || [];
  renderBundle();
}
(function initLanguage(){
  const lang = localStorage.getItem("language") || "ar";
  document.documentElement.lang = lang;
  document.documentElement.dir  = (lang === "ar") ? "rtl" : "ltr";
})();

let editing = false;

function toggleEdit() {
  const items = document.querySelectorAll(".editable");
  const btn = document.querySelector(".editBtn");

  editing = !editing;

  items.forEach(item => {
    item.contentEditable = editing;
    item.classList.toggle("editing", editing);
  });

  btn.textContent = editing ? "💾 حفظ" : "✏️ تعديل";
}