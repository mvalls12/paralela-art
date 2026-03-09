const { useState, useEffect, useRef, useCallback } = React;

const PATTERNS = ["Cercles","Espiral","Línies radials","Ones","Quadrícula","Hexàgons"];
const PATTERN_ICONS = ["◎","🌀","✳","〰","▦","⬡"];
const PRESETS = [
  { name:"Oceà",   colors:["#0a1628","#1a3a6b","#2d6fa4","#56b3d4","#a8e0f0"] },
  { name:"Aurora", colors:["#0d0d1a","#1a0a3d","#3d1a7a","#7a3db8","#c87dff"] },
  { name:"Foc",    colors:["#1a0500","#7a1a00","#d44000","#ff8c00","#ffd700"] },
  { name:"Bosc",   colors:["#050f05","#0a2a0a","#1a5c1a","#3da63d","#8cdb8c"] },
  { name:"Mono",   colors:["#050505","#1a1a1a","#404040","#909090","#e0e0e0"] },
];

function hexToRgb(hex){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return{r,g,b};}
function interpolateColor(c1,c2,t){const a=hexToRgb(c1),b=hexToRgb(c2);return `rgb(${Math.round(a.r+(b.r-a.r)*t)},${Math.round(a.g+(b.g-a.g)*t)},${Math.round(a.b+(b.b-a.b)*t)})`;}
function getLayerColor(colors,idx,total){const t=idx/Math.max(total-1,1),seg=(colors.length-1)*t,i=Math.floor(seg),f=seg-i;if(i>=colors.length-1)return colors[colors.length-1];return interpolateColor(colors[i],colors[i+1],f);}

function drawPattern(ctx,pattern,cx,cy,size,color,depth,ox,oy,li){
  ctx.save();ctx.translate(ox*depth,oy*depth);
  ctx.strokeStyle=color;ctx.lineWidth=Math.max(0.5,1.5-li*0.1);ctx.globalAlpha=0.85-li*0.05;
  if(pattern==="Cercles"){for(let r=size*0.1;r<=size;r+=size*0.12){ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();}}
  else if(pattern==="Espiral"){ctx.beginPath();for(let a=0;a<Math.PI*20;a+=0.05){const r=(a/(Math.PI*20))*size;const x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);a===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}
  else if(pattern==="Línies radials"){for(let i=0;i<36;i++){const a=(i/36)*Math.PI*2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*size,cy+Math.sin(a)*size);ctx.stroke();}}
  else if(pattern==="Ones"){const sx=cx-size,sy=cy-size;for(let y=sy;y<=cy+size;y+=size*0.12){ctx.beginPath();for(let x=sx;x<=cx+size;x+=2){const w=Math.sin((x-sx)*0.04+li)*size*0.06;x===sx?ctx.moveTo(x,y+w):ctx.lineTo(x,y+w);}ctx.stroke();}}
  else if(pattern==="Quadrícula"){const st=size*0.15,sx=cx-size,sy=cy-size;for(let x=sx;x<=cx+size;x+=st){ctx.beginPath();ctx.moveTo(x,sy);ctx.lineTo(x,cy+size);ctx.stroke();}for(let y=sy;y<=cy+size;y+=st){ctx.beginPath();ctx.moveTo(sx,y);ctx.lineTo(cx+size,y);ctx.stroke();}}
  else if(pattern==="Hexàgons"){const r=size*0.12,hx=r*Math.sqrt(3),hy=r*1.5;for(let row=-6;row<=6;row++)for(let col=-6;col<=6;col++){const x=cx+col*hx+(row%2===0?0:hx/2),y=cy+row*hy;if(Math.abs(x-cx)<=size+r&&Math.abs(y-cy)<=size+r){ctx.beginPath();for(let i=0;i<6;i++){const a=(Math.PI/3)*i-Math.PI/6;i===0?ctx.moveTo(x+r*Math.cos(a),y+r*Math.sin(a)):ctx.lineTo(x+r*Math.cos(a),y+r*Math.sin(a));}ctx.closePath();ctx.stroke();}}}
  ctx.restore();
}

function getInstructions(pattern,layers,depth,size){
  const m={
    "Cercles":[`Dibuixa un punt central al paper.`,`Amb un compàs, traça ${Math.ceil(layers*0.8)} cercles concèntrics separats ${Math.round(size*0.12)}px.`,`Repeteix el conjunt en capes superposades, desplaçades lleument cap a la dreta i amunt.`,`Usa colors progressius del més fosc (fons) al més clar (primer pla).`,`El desplaçament entre capes ha de ser proporcional: última capa = ${Math.round(depth)}px.`],
    "Espiral":[`Marca el centre del paper.`,`Dibuixa una espiral des del centre, avançant 18° per pas amb transportador.`,`El radi ha d'augmentar fins a ${size}px equivalent al paper.`,`Afegeix capes addicionals lleugerament desplaçades per crear profunditat.`,`Varía el gruix: més gruixut al fons, més fi al davant.`],
    "Línies radials":[`Dibuixa un punt central.`,`Traça 36 línies des del centre cada 10° (usa transportador).`,`Cada línia ha de tenir longitud de ${size}px.`,`Repeteix el conjunt per a cada capa canviant el color.`,`La superposició desplaçada crea sensació de rotació i profunditat.`],
    "Ones":[`Traça línies horitzontals paral·leles uniformement separades.`,`Cada línia ha de tenir ondulació sinusoïdal d'amplitud ${Math.round(size*0.06)}px.`,`Usa una plantilla de corba per mantenir consistència.`,`Superposa capes amb ones lleugerament desfasades.`,`El desfasament augmenta per capa: última = ${layers*18}°.`],
    "Quadrícula":[`Dibuixa quadrícula de línies verticals i horitzontals separades ${Math.round(size*0.15)}px.`,`L'àrea ha d'ocupar ${size*2}×${size*2}px al voltant del centre.`,`Repeteix per a cada capa, desplaçant-la progressivament.`,`El desplaçament acumulat crea l'efecte Moiré.`,`Línies més primes al davant, més gruixudes al fons.`],
    "Hexàgons":[`Dibuixa una graella hexagonal amb radi de ${Math.round(size*0.12)}px per hexàgon.`,`Cada hexàgon té 6 costats iguals; usa compàs per marcar vèrtexs.`,`Omple l'àrea fins a ${size}px des del centre en totes direccions.`,`Superposa capes hexagonals amb petit desplaçament.`,`La curvatura visual emergeix de la repetició i el desplaçament.`],
  };
  return m[pattern]||[];
}

function App(){
  const canvasRef=useRef(null);
  const mouseRef=useRef({x:0,y:0});
  const [layers,setLayers]=useState(5);
  const [depth,setDepth]=useState(30);
  const [pattern,setPattern]=useState("Cercles");
  const [preset,setPreset]=useState(0);
  const [customColors,setCustomColors]=useState(null);
  const [size,setSize]=useState(250);
  const [tab,setTab]=useState("config");
  const [pdfStatus,setPdfStatus]=useState("");

  const colors=customColors||PRESETS[preset].colors;

  const render=useCallback((ox,oy)=>{
    const c=canvasRef.current;if(!c)return;
    const ctx=c.getContext("2d"),W=c.width,H=c.height,cx=W/2,cy=H/2;
    ctx.clearRect(0,0,W,H);ctx.fillStyle=colors[0];ctx.fillRect(0,0,W,H);
    for(let i=layers-1;i>=0;i--){
      const color=getLayerColor(colors,i+1,layers+1);
      const d=((i+1)/layers)*(depth/100);
      const s=size*(0.6+(i/layers)*0.8);
      drawPattern(ctx,pattern,cx,cy,s,color,d,ox,oy,i);
    }
  },[layers,depth,pattern,colors,size]);

  useEffect(()=>{
    const c=canvasRef.current;if(!c)return;
    const fn=e=>{const r=c.getBoundingClientRect();mouseRef.current={x:e.clientX-r.left-c.width/2,y:e.clientY-r.top-c.height/2};};
    c.addEventListener("mousemove",fn);return()=>c.removeEventListener("mousemove",fn);
  },[]);

  useEffect(()=>{
    let f;const loop=()=>{render(mouseRef.current.x,mouseRef.current.y);f=requestAnimationFrame(loop);};
    f=requestAnimationFrame(loop);return()=>cancelAnimationFrame(f);
  },[render]);

  const downloadSVG=()=>{
    const W=600,H=600,cx=W/2,cy=H/2;
    let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${colors[0]}"/>`;
    for(let i=layers-1;i>=0;i--){const color=getLayerColor(colors,i+1,layers+1);const s=size*(0.6+(i/layers)*0.8);if(pattern==="Cercles"){for(let r=s*0.1;r<=s;r+=s*0.12)svg+=`<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none" stroke="${color}" stroke-width="1.2" opacity="0.85"/>`;}}
    svg+=`</svg>`;
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));a.download="parallax-art.svg";a.click();
  };

  const downloadPNG=()=>{
    render(0,0);
    const a=document.createElement("a");a.href=canvasRef.current.toDataURL("image/png");a.download="parallax-art.png";a.click();
  };

  const downloadPDF=()=>{
    setPdfStatus("Generant…");
    try{
      render(0,0);
      const imgData=canvasRef.current.toDataURL("image/png");
      const steps=getInstructions(pattern,layers,depth,size);
      const tips=["Treballa sobre paper blanc de gramatge alt (mínim 120g).","Usa llapis de colors degradats del fons al primer pla.","Com més capes, més intensa serà la il·lusió òptica.","L'efecte es percep millor en moviment lateral.","Imprimeix aquesta imatge i usa-la com a plantilla guia."];
      const colorsInfo=colors.map((c,i)=>i===0?`Fons: ${c}`:i===colors.length-1?`Front: ${c}`:`C${i}: ${c}`).join(" · ");
      const swatches=colors.map(c=>`<span style="display:inline-block;width:20px;height:20px;border-radius:4px;background:${c};border:1px solid #ddd;margin-right:4px;vertical-align:middle"></span>`).join("");
      const stepsHTML=steps.map((s,i)=>`<div style="display:flex;gap:10px;margin-bottom:10px;font-size:13px;line-height:1.5"><span style="min-width:24px;height:24px;background:#7c3aed;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;flex-shrink:0">${i+1}</span><span>${s}</span></div>`).join("");
      const tipsHTML=tips.map(t=>`<li style="padding:4px 0;font-size:13px;color:#374151">${t}</li>`).join("");
      const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Art Paralaxi — Instruccions</title><style>body{font-family:system-ui,sans-serif;max-width:700px;margin:auto;padding:32px;color:#1a1a2e}h1{color:#7c3aed;font-size:24px;margin-bottom:4px}h2{color:#5b21b6;font-size:15px;border-bottom:2px solid #ede9fe;padding-bottom:4px;margin:20px 0 10px}.params{background:#f5f3ff;border-radius:10px;padding:14px;font-size:13px;color:#4c1d95;margin-bottom:20px}ul{padding-left:18px}.btn{display:block;margin:0 auto 24px;padding:12px 32px;background:#7c3aed;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;font-family:inherit}@media print{.btn{display:none}}</style></head><body><button class="btn" onclick="window.print()">🖨️ Imprimir / Desar com PDF</button><h1>Art Paralaxi — Instruccions</h1><div style="text-align:center;margin:16px 0"><img src="${imgData}" style="width:260px;height:260px;border-radius:12px;border:2px solid #ede9fe"/></div><div class="params"><strong>Patró:</strong> ${pattern} &nbsp;·&nbsp; <strong>Capes:</strong> ${layers} &nbsp;·&nbsp; <strong>Profunditat:</strong> ${depth} &nbsp;·&nbsp; <strong>Mida:</strong> ${size}px<br/><strong>Colors:</strong> ${colorsInfo}<br/><div style="margin-top:8px">${swatches}</div></div><h2>Com crear-lo a mà</h2>${stepsHTML}<h2>Consells generals</h2><ul>${tipsHTML}</ul><p style="margin-top:24px;font-size:11px;color:#aaa;text-align:center;border-top:1px solid #eee;padding-top:12px">Generat amb el Generador d'Art Paralaxi · ${new Date().toLocaleDateString("ca-ES")}</p></body></html>`;

      // Descàrrega directa com HTML
      const blob=new Blob([html],{type:"text/html"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download="parallax-instruccions.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPdfStatus("✓ Obre el fitxer descarregat i clica 'Imprimir' → 'Desar com PDF'");
      setTimeout(()=>setPdfStatus(""),8000);
    }catch(e){setPdfStatus("Error: "+e.message);setTimeout(()=>setPdfStatus(""),4000);}
  };

  const activeColors=customColors||PRESETS[preset].colors;

  const S={
    wrap:{minHeight:"100vh",background:"#09090f",color:"#e8e8f0",fontFamily:"'DM Sans',system-ui,sans-serif",padding:"20px 16px",display:"flex",flexDirection:"column",alignItems:"center"},
    card:{width:"100%",maxWidth:520,display:"flex",flexDirection:"column",gap:16},
    title:{fontSize:24,fontWeight:700,background:"linear-gradient(135deg,#a78bfa,#67e8f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:0,textAlign:"center"},
    sub:{color:"#555",fontSize:12,textAlign:"center",marginTop:4},
    canvas:{borderRadius:14,border:"1px solid #1e1e2e",cursor:"crosshair",display:"block",width:"100%",height:"auto",boxShadow:"0 0 32px rgba(167,139,250,0.15)"},
    panel:{background:"#111118",borderRadius:14,padding:16,border:"1px solid #1a1a2e"},
    tabs:{display:"flex",gap:4,background:"#09090f",borderRadius:10,padding:4,marginBottom:14},
    tab:(a)=>({flex:1,padding:"7px 0",borderRadius:7,border:"none",fontSize:12,fontWeight:600,cursor:"pointer",background:a?"#1e1e35":"transparent",color:a?"#a78bfa":"#555"}),
    label:{fontSize:12,color:"#aaa"},
    val:{fontSize:12,color:"#a78bfa",fontWeight:700},
    btn:(bg)=>({padding:"10px 0",borderRadius:8,border:"none",background:bg,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",width:"100%",fontFamily:"inherit"}),
  };

  return(
    React.createElement("div",{style:S.wrap},
      React.createElement("div",{style:S.card},
        React.createElement("div",null,
          React.createElement("h1",{style:S.title},"Generador d'Art Paralaxi"),
          React.createElement("p",{style:S.sub},"Mou el ratolí sobre la imatge per activar l'efecte")
        ),
        React.createElement("canvas",{ref:canvasRef,width:480,height:480,style:S.canvas}),
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}},
          React.createElement("button",{style:S.btn("#7c3aed"),onClick:downloadSVG},"↓ SVG"),
          React.createElement("button",{style:S.btn("#0e7490"),onClick:downloadPNG},"↓ PNG")
        ),
        React.createElement("button",{style:{...S.btn("linear-gradient(135deg,#5b21b6,#7c3aed)"),padding:"13px 0",fontSize:15},onClick:downloadPDF},"↓ PDF + Instruccions per imprimir"),
        pdfStatus&&React.createElement("p",{style:{textAlign:"center",fontSize:12,color:"#a78bfa",margin:0}},pdfStatus),
        React.createElement("div",{style:S.panel},
          React.createElement("div",{style:S.tabs},
            ["config","colors","patrons"].map(t=>
              React.createElement("button",{key:t,style:S.tab(tab===t),onClick:()=>setTab(t)},
                t==="config"?"⚙️ Config":t==="colors"?"🎨 Colors":"🔷 Patrons"
              )
            )
          ),
          tab==="config"&&React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:14}},
            [{l:"Capes",v:layers,s:setLayers,min:2,max:10,step:1},{l:"Profunditat",v:depth,s:setDepth,min:5,max:80,step:5},{l:"Mida del patró",v:size,s:setSize,min:100,max:380,step:10}].map(({l,v,s,min,max,step})=>
              React.createElement("div",{key:l},
                React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:5}},
                  React.createElement("span",{style:S.label},l),
                  React.createElement("span",{style:S.val},v)
                ),
                React.createElement("input",{type:"range",min,max,step,value:v,onChange:e=>s(Number(e.target.value)),style:{width:"100%",accentColor:"#a78bfa"}})
              )
            ),
            React.createElement("p",{style:{fontSize:11,color:"#444",margin:0}},"Patró actiu: ",React.createElement("span",{style:{color:"#a78bfa",fontWeight:700}},pattern)," — canvia'l a Patrons")
          ),
          tab==="colors"&&React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:12}},
            React.createElement("p",{style:{fontSize:11,color:"#555",margin:0}},"Presets"),
            React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:8}},
              PRESETS.map((p,i)=>
                React.createElement("button",{key:p.name,onClick:()=>{setPreset(i);setCustomColors(null);},
                  style:{padding:"6px 10px",borderRadius:8,border:`2px solid ${preset===i&&!customColors?"#a78bfa":"#1e1e35"}`,background:"#09090f",cursor:"pointer",fontSize:12,color:"#ccc",fontFamily:"inherit"}},
                  React.createElement("div",{style:{display:"flex",gap:3,marginBottom:3}},
                    p.colors.slice(1).map((c,j)=>React.createElement("div",{key:j,style:{width:12,height:12,borderRadius:2,background:c}}))
                  ),
                  p.name
                )
              )
            ),
            React.createElement("p",{style:{fontSize:11,color:"#555",margin:0}},"Colors personalitzats"),
            React.createElement("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}},
              activeColors.map((c,i,arr)=>
                React.createElement("div",{key:i,style:{textAlign:"center"}},
                  React.createElement("input",{type:"color",value:c,onChange:e=>{const nc=[...arr];nc[i]=e.target.value;setCustomColors(nc);},style:{width:38,height:38,borderRadius:8,border:"none",cursor:"pointer",display:"block"}}),
                  React.createElement("div",{style:{fontSize:10,color:"#444",marginTop:2}},i===0?"fons":i===arr.length-1?"front":`C${i}`)
                )
              )
            )
          ),
          tab==="patrons"&&React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}},
            PATTERNS.map((p,i)=>
              React.createElement("button",{key:p,onClick:()=>setPattern(p),
                style:{padding:"12px 4px",borderRadius:10,border:`2px solid ${pattern===p?"#a78bfa":"#1e1e35"}`,background:pattern===p?"#1a1030":"#09090f",cursor:"pointer",fontSize:11,color:pattern===p?"#c4b5fd":"#777",fontWeight:pattern===p?700:400,display:"flex",flexDirection:"column",alignItems:"center",gap:4,fontFamily:"inherit"}},
                React.createElement("span",{style:{fontSize:18}},PATTERN_ICONS[i]),
                p
              )
            )
          )
        )
      )
    )
  );
}

const root=ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
