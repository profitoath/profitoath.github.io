/* ============================================================
   profitoath — shared site behaviour
   Lenis smooth scroll · GSAP reveals · Three.js bg · nav · ticker
   Link on every page AFTER the CDN scripts (three, gsap, ScrollTrigger, lenis).
   Every routine no-ops gracefully if its element/lib is absent.
   ============================================================ */
(function(){
  "use strict";
  const $=(s,c=document)=>c.querySelector(s);
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const lerp=(a,b,t)=>a+(b-a)*t;
  let lenis=null;

  /* ---------- Lenis smooth scroll ---------- */
  function initLenis(){
    if(typeof Lenis==='undefined') return;
    lenis=new Lenis({lerp:.09,wheelMultiplier:1,smoothWheel:true});
    lenis.on('scroll',()=>{ if(window.ScrollTrigger) ScrollTrigger.update(); });
    (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })();
    $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
      const id=a.getAttribute('href');
      if(id.length>1 && $(id)){ e.preventDefault(); lenis.scrollTo($(id),{offset:-60}); closeDrawer(); }
    }));
    window.__lenis=lenis;
  }

  /* ---------- nav scrolled + mobile drawer ---------- */
  function initNav(){
    const nav=$('nav.site');
    if(nav){ const upd=()=>nav.classList.toggle('scrolled',scrollY>20); upd(); addEventListener('scroll',upd,{passive:true}); }
    const btn=$('.menu-btn'), drawer=$('#drawer');
    if(btn&&drawer){
      btn.addEventListener('click',()=>drawer.classList.add('open'));
      $('.close',drawer)?.addEventListener('click',closeDrawer);
      $$('a',drawer).forEach(a=>a.addEventListener('click',closeDrawer));
    }
  }
  function closeDrawer(){ $('#drawer')?.classList.remove('open'); }

  /* ---------- ticker ---------- */
  function buildTicker(){
    const track=$('#ticker-track'); if(!track) return;
    const items=[
      ['BBCA','9.875','+1.4%','up'],['BBRI','4.210','+0.8%','up'],['TLKM','3.090','-0.6%','dn'],
      ['EUR/USD','1.1660','+0.2%','up'],['XAU','2.417','+0.9%','up'],['AAPL','312.06','-0.4%','dn'],
      ['BTC','67.430','+3.1%','up'],['JKSE','7.842','+0.5%','up'],['USD/JPY','149.8','-0.3%','dn'],
      ['ASII','5.150','+1.1%','up'],['NVDA','128.4','+2.2%','up'],['WTI','78.9','-1.0%','dn']
    ];
    const row=items.map(([s,p,c,d])=>`<span class="it"><b>${s}</b> ${p} <span class="${d}">${c}</span></span>`).join('');
    track.innerHTML=row+row;
  }

  /* ---------- count-up ---------- */
  function countUp(){
    if(typeof gsap==='undefined') return;
    $$('[data-count]').forEach(el=>{
      const target=+el.dataset.count, suf=el.dataset.suffix||'';
      ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter:()=>{
        const o={v:0}; gsap.to(o,{v:target,duration:1.6,ease:'power3.out',onUpdate:()=>{
          el.textContent=Math.floor(o.v).toLocaleString('id-ID')+suf;}});
      }});
    });
  }

  /* ---------- GSAP reveals ---------- */
  function initGSAP(){
    if(typeof gsap==='undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    // hero stagger (split a [data-stagger] heading into words)
    const h=$('[data-stagger]');
    if(h){
      h.innerHTML=h.innerHTML.replace(/(<span[^>]*>.*?<\/span>|[^\s<]+)(\s*)/g,
        (m,w,sp)=>`<span class="word" style="display:inline-block">${w}</span>${sp}`);
      gsap.set('.word',{yPercent:120,opacity:0});
      gsap.to('.word',{yPercent:0,opacity:1,duration:1.1,ease:'expo.out',stagger:.045,delay:.1});
    }
    const fades=$$('[data-fade]');
    if(fades.length){ gsap.set(fades,{opacity:0,y:30}); gsap.to(fades,{opacity:1,y:0,duration:1,ease:'expo.out',stagger:.12,delay:.45}); }
    $$('.reveal').forEach(el=>gsap.to(el,{opacity:1,y:0,duration:.9,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 90%'}}));
    // parallax-tagged elements
    $$('[data-parallax]').forEach(el=>{
      const sp=parseFloat(el.dataset.parallax)||-60;
      gsap.to(el,{y:sp,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:1}});
    });
  }

  /* ---------- card pointer glow ---------- */
  function cardGlow(){
    $$('.card').forEach(c=>c.addEventListener('pointermove',e=>{
      const r=c.getBoundingClientRect();
      c.style.setProperty('--mx',(e.clientX-r.left)+'px');
      c.style.setProperty('--my',(e.clientY-r.top)+'px');
    }));
  }

  /* ---------- Three.js holographic background ---------- */
  function initThree(){
    const canvas=$('#bg-canvas');
    if(!canvas) return;
    if(typeof THREE==='undefined'){ canvas.style.display='none'; return; }
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setSize(innerWidth,innerHeight);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,100);
    camera.position.set(0,0,15);
    const group=new THREE.Group(); scene.add(group);
    const mode=canvas.dataset.mode||'globe'; // 'globe' (home) or 'calm' (inner pages)

    const R=4.4;
    group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(R,4),
      new THREE.MeshBasicMaterial({color:0x0d3b34,wireframe:true,transparent:true,opacity:.16})));
    group.add(new THREE.Mesh(new THREE.SphereGeometry(R*.985,48,48),
      new THREE.MeshBasicMaterial({color:0x051713,transparent:true,opacity:.5})));

    const N=64,nodePos=[],arr=new Float32Array(N*3);
    for(let i=0;i<N;i++){const phi=Math.acos(-1+2*i/N),th=Math.sqrt(N*Math.PI)*phi;
      const x=R*Math.cos(th)*Math.sin(phi),y=R*Math.sin(th)*Math.sin(phi),z=R*Math.cos(phi);
      arr[i*3]=x;arr[i*3+1]=y;arr[i*3+2]=z;nodePos.push(new THREE.Vector3(x,y,z));}
    const ng=new THREE.BufferGeometry();ng.setAttribute('position',new THREE.BufferAttribute(arr,3));
    group.add(new THREE.Points(ng,new THREE.PointsMaterial({color:0x5bffd0,size:.09,transparent:true,opacity:.9,blending:THREE.AdditiveBlending})));

    const arcs=[];
    function arc(a,b){
      const mid=a.clone().add(b).multiplyScalar(.5).normalize().multiplyScalar(R*1.5);
      const curve=new THREE.QuadraticBezierCurve3(a,mid,b);
      const g=new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
      const m=new THREE.LineBasicMaterial({color:Math.random()>.5?0x16e0a8:0x0bd0ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending});
      group.add(new THREE.Line(g,m));
      const pulse=new THREE.Mesh(new THREE.SphereGeometry(.05,8,8),new THREE.MeshBasicMaterial({color:0xeafff8,blending:THREE.AdditiveBlending}));
      group.add(pulse);
      arcs.push({curve,m,pulse,t:Math.random(),speed:.0016+Math.random()*.0026});
    }
    const arcCount=mode==='calm'?10:22;
    for(let i=0;i<arcCount;i++) arc(nodePos[(Math.random()*N)|0],nodePos[(Math.random()*N)|0]);

    const P=mode==='calm'?500:900,pa=new Float32Array(P*3);
    for(let i=0;i<P;i++){const r=8+Math.random()*14,t=Math.random()*Math.PI*2,p=Math.acos(2*Math.random()-1);
      pa[i*3]=r*Math.sin(p)*Math.cos(t);pa[i*3+1]=r*Math.sin(p)*Math.sin(t);pa[i*3+2]=r*Math.cos(p);}
    const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pa,3));
    const particles=new THREE.Points(pg,new THREE.PointsMaterial({color:0x2c6e63,size:.035,transparent:true,opacity:.7}));
    scene.add(particles);

    if(mode==='calm'){ group.position.x=3.4; group.scale.setScalar(.85); camera.position.z=17; }

    let mx=0,my=0,tmx=0,tmy=0,scrollV=0;
    addEventListener('pointermove',e=>{tmx=e.clientX/innerWidth-.5;tmy=e.clientY/innerHeight-.5;},{passive:true});
    if(lenis) lenis.on('scroll',({velocity})=>{scrollV=Math.min(Math.abs(velocity||0)*.0008,.06);});

    if(window.ScrollTrigger && mode==='globe' && $('#quant')){
      gsap.to(camera.position,{z:11,y:-1.2,ease:'none',scrollTrigger:{trigger:'#quant',start:'top bottom',end:'bottom top',scrub:1}});
    }
    if(window.ScrollTrigger){
      gsap.to(group.rotation,{y:'+=2.0',ease:'none',scrollTrigger:{trigger:'main',start:'top top',end:'bottom bottom',scrub:1.5}});
    }

    const clock=new THREE.Clock();
    (function loop(){
      requestAnimationFrame(loop);
      const dt=clock.getDelta();
      mx=lerp(mx,tmx,.05);my=lerp(my,tmy,.05);
      group.rotation.y+=.0011+scrollV;group.rotation.x=lerp(group.rotation.x,my*.4,.05);
      if(mode!=='calm') group.position.x=lerp(group.position.x,mx*1.4,.05);
      particles.rotation.y-=.0004;particles.rotation.x+=.0002;scrollV*=.94;
      arcs.forEach(a=>{a.t+=a.speed+scrollV*.4;if(a.t>1)a.t=0;
        a.m.opacity=.12+.25*Math.sin(a.t*Math.PI);
        a.pulse.position.copy(a.curve.getPoint(a.t));
        a.pulse.scale.setScalar(.8+1.2*Math.sin(a.t*Math.PI));});
      renderer.render(scene,camera);
    })();
    addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
  }

  /* ---------- boot ---------- */
  window.addEventListener('DOMContentLoaded',()=>{
    initLenis(); initNav(); buildTicker(); initGSAP(); countUp(); cardGlow(); initThree();
    // expose tiny helpers for page-specific scripts
    window.PO={$,$$,lerp,get lenis(){return lenis;}};
  });
})();
