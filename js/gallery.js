/* =========================================================
   js/gallery.js
   Masonry photo gallery + filter chips + lightbox
   ========================================================= */
(function(){
  "use strict";

  var D = (typeof window !== "undefined" && window.SALON_INFO) || {};
  var gallery = D.gallery || [];

  function esc(v){
    return String(v==null?"":v).replace(/[&<>"]/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];
    });
  }
  function $(s){return document.querySelector(s);}
  function $$(s,r){return (r||document).querySelectorAll(s);}

  /* Filter chips — a chip with zero photos hides itself */
  var CHIPS = [
    {key:"all", label:"All"},
    {key:"bridal", label:"Bridal"},
    {key:"hair", label:"Hair"},
    {key:"nails", label:"Nails"},
    {key:"salon", label:"Salon"}
  ];

  var state = {filter:"all", items:[], index:0, container:null};

  function countFor(key){
    if(key==="all") return gallery.length;
    return gallery.filter(function(g){ return g.category===key; }).length;
  }

  function filteredItems(){
    return state.filter==="all" ? gallery : gallery.filter(function(g){ return g.category===state.filter; });
  }

  /* ---------- render masonry grid (CSS columns) ---------- */
  function renderGrid(containerId){
    var grid = $(containerId);
    if(!grid) return;
    state.items = filteredItems();
    state.container = containerId;
    grid.innerHTML = state.items.map(function(g){
      var dims = (g.width&&g.height)? 'width="'+g.width+'" height="'+g.height+'"' : "";
      var cat = esc(g.category || "salon");
      var stem = g.src.replace(/\.(jpg|jpeg|png)$/i, "");
      var w = g.width || 0;
      var widths = [480,720,800,1200].filter(function(tw){ return tw <= w; });
    if(!widths.length && w) widths = [w];
      var webp = widths.map(function(tw){ return stem+"-"+tw+".webp "+tw+"w"; }).join(", ");
      return (
        '<figure class="photo-item reveal" data-cat="'+cat+'" data-idx="'+state.items.indexOf(g)+'">'+
        '<picture class="photo-picture">'+
        (webp ? '<source srcset="'+webp+'" sizes="(max-width: 1023px) 50vw, 33vw" type="image/webp">' : "")+
        '<img src="'+esc(g.src)+'" alt="'+esc(g.alt)+'" '+dims+' loading="lazy" decoding="async">'+
        '</picture>'+
        '<figcaption class="photo-cap">'+esc(g.caption)+'</figcaption>'+
        '<button class="photo-expand" type="button" aria-label="'+esc(g.caption)+' ko full size mein dekhein">'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="18 5 12 9 6 5"/></svg>'+
        '</button>'+
        '</figure>'
      );
    }).join("");
    observeReveal();
  }

  /* ---------- filter chips ---------- */
  function renderChips(){
    var wrap = $("#filterChips");
    if(!wrap) return;
    wrap.innerHTML = CHIPS.map(function(c){
      var count = countFor(c.key);
      if(count===0) return ""; // hide empty chip
      var active = c.key===state.filter;
      return (
        '<button class="filter-chip' + (active ? ' chip-active' : '') + '" type="button" data-cat="'+c.key+'" aria-pressed="'+(active?'true':'false')+'" '+
        'aria-label="'+esc(c.label)+' photo ('+count+')">'+esc(c.label)+'</button>'
      );
    }).join("");
    wrap.querySelectorAll(".filter-chip").forEach(function(btn){
      btn.addEventListener("click", function(){
        state.filter = btn.dataset.cat;
        wrap.querySelectorAll(".filter-chip").forEach(function(b){
          var act = b.dataset.cat===state.filter;
          b.setAttribute("aria-pressed", act);
          b.classList.toggle("chip-active", act);
        });
        renderGrid(state.container);
      });
    });
  }

  /* ---------- reveal on enter ---------- */
  function observeReveal(){
    if(!("IntersectionObserver" in window)) return;
    $$(".photo-item").forEach(function(el){
      el.style.opacity = "0";
      el.style.transform = "translateY(12px)";
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          en.target.style.opacity = "1";
          en.target.style.transform = "translateY(0)";
          io.unobserve(en.target);
        }
      });
    }, {threshold:0.12});
    $$(".photo-item").forEach(function(el){ io.observe(el); });
  }

  /* ---------- lightbox ---------- */
  var lb = $("#lightbox");
  var lbImg = $("#lbImg");
  var lbCap = $("#lbCap");
  var lbClose = $("#lbClose");
  var lbPrev = $("#lbPrev");
  var lbNext = $("#lbNext");
  var lbCounter = $("#lbCounter");

  function openLightbox(idx){
    if(!lb) return;
    state.index = (idx + state.items.length) % state.items.length;
    refreshLightbox();
    lb.classList.add("open");
    lb.setAttribute("aria-hidden","false");
    lb.removeAttribute("inert");
    document.body.classList.add("no-scroll");
    lbClose && lbClose.focus();
  }

  function closeLightbox(){
    if(!lb) return;
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden","true");
    lb.setAttribute("inert","");
    document.body.classList.remove("no-scroll");
  }

  function refreshLightbox(){
    var g = state.items[state.index];
    if(!g) return;
    lbImg.src = g.src;
    lbImg.alt = g.alt;
    if(lbCap) lbCap.textContent = g.caption;
    if(lbCounter) lbCounter.textContent = (state.index+1) + " / " + state.items.length;
  }

  /* grid click -> open lightbox (only visible/filtered photos) */
  document.addEventListener("click", function(event){
    var tile = event.target.closest(".photo-item");
    if(tile){
      var idx = Number(tile.dataset.idx);
      openLightbox(idx);
      return;
    }
  });

  if(lbClose) lbClose.addEventListener("click", closeLightbox);
  if(lbPrev) lbPrev.addEventListener("click", function(){ state.index=(state.index-1+state.items.length)%state.items.length; refreshLightbox(); });
  if(lbNext) lbNext.addEventListener("click", function(){ state.index=(state.index+1)%state.items.length; refreshLightbox(); });

  if(lb){
    lb.addEventListener("click", function(event){ if(event.target===lb) closeLightbox(); });
    /* focus trap */
    lb.addEventListener("keydown", function(event){
      if(event.key!=="Tab") return;
      var focusables = $$("button", lb).filter(function(b){ return !b.disabled && b.offsetParent!==null; });
      if(!focusables.length) return;
      var first=focusables[0], last=focusables[focusables.length-1];
      if(event.shiftKey && document.activeElement===first){ event.preventDefault(); last.focus(); }
      else if(!event.shiftKey && document.activeElement===last){ event.preventDefault(); first.focus(); }
    });
  }

  document.addEventListener("keydown", function(event){
    if(!lb || !lb.classList.contains("open")) return;
    if(event.key==="Escape") closeLightbox();
    else if(event.key==="ArrowLeft"){ state.index=(state.index-1+state.items.length)%state.items.length; refreshLightbox(); }
    else if(event.key==="ArrowRight"){ state.index=(state.index+1)%state.items.length; refreshLightbox(); }
  });

  /* swipe on lightbox (phones) */
  var sx=0, sy=0;
  if(lb){
    lb.addEventListener("touchstart", function(e){ sx=e.changedTouches[0].clientX; sy=e.changedTouches[0].clientY; },{passive:true});
    lb.addEventListener("touchend", function(e){
      var dx=e.changedTouches[0].clientX-sx;
      var dy=e.changedTouches[0].clientY-sy;
      if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)){
        if(dx<0){ state.index=(state.index+1)%state.items.length; refreshLightbox(); }
        else { state.index=(state.index-1+state.items.length)%state.items.length; refreshLightbox(); }
      }
    },{passive:true});
  }

  /* ---------- init ---------- */
  function init(){
    var grid = $("#galleryGrid");
    var wrap = $("#filterChips");

    /* preselect chip from URL hash (gallery.html#bridal) */
    try {
      var hash = window.location.hash.replace(/^#/,"");
      if(hash && CHIPS.some(function(c){ return c.key===hash; })){
        state.filter = hash;
      }
    } catch(e){}

    if(!grid && !wrap) return;
    if(wrap) renderChips();
    if(grid) renderGrid("#galleryGrid");
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
