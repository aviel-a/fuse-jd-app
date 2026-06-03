import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const TEAL = "#F5C400";
const DARK = "#0a0f0e";
const CARD = "#111918";
const BORDER = "#1e2e2c";
const MUTED = "#4a6663";

const TEAMS = ["Autonomy","Embedded Software","Hardware","GNC","System Engineering","Program Management","QA / Validation","Other"];
const LEVELS = ["Junior","Mid-level","Senior","Lead","Principal","Manager","Director"];
const LOCATIONS = ["Rosh HaAyin","Tel Aviv","Haifa","Remote"];

// ─── Pure JS Zip builder ──────────────────────────────────────────────────
function buildZip(files) {
  const enc = new TextEncoder();
  const u8 = s => typeof s === "string" ? enc.encode(s) : s;
  const crc32 = (buf) => {
    const t = Array.from({length:256},(_,i)=>{let x=i;for(let j=0;j<8;j++)x=x&1?(0xEDB88320^(x>>>1)):(x>>>1);return x;});
    let c=0xFFFFFFFF; for(const b of buf)c=t[(c^b)&0xFF]^(c>>>8); return(c^0xFFFFFFFF)>>>0;
  };
  const le2=(v,a,o)=>{a[o]=v&255;a[o+1]=(v>>8)&255;};
  const le4=(v,a,o)=>{a[o]=v&255;a[o+1]=(v>>8)&255;a[o+2]=(v>>16)&255;a[o+3]=(v>>24)&255;};
  const local=[],central=[];let offset=0;
  for(const[name,content]of Object.entries(files)){
    const data=u8(content),crc=crc32(data),nenc=enc.encode(name);
    const lh=new Uint8Array(30+nenc.length);
    le4(0x04034b50,lh,0);le2(20,lh,4);le2(0,lh,6);le2(0,lh,8);le2(0,lh,10);le2(0,lh,12);
    le4(crc,lh,14);le4(data.length,lh,18);le4(data.length,lh,22);le2(nenc.length,lh,26);lh.set(nenc,30);
    const cd=new Uint8Array(46+nenc.length);
    le4(0x02014b50,cd,0);le2(20,cd,4);le2(20,cd,6);le2(0,cd,8);le2(0,cd,10);le2(0,cd,12);le2(0,cd,14);
    le4(crc,cd,16);le4(data.length,cd,20);le4(data.length,cd,24);le2(nenc.length,cd,28);le4(offset,cd,42);cd.set(nenc,46);
    local.push(lh,data);central.push(cd);offset+=lh.length+data.length;
  }
  const cdSize=central.reduce((s,c)=>s+c.length,0);
  const eocd=new Uint8Array(22);
  le4(0x06054b50,eocd,0);le2(central.length,eocd,8);le2(central.length,eocd,10);le4(cdSize,eocd,12);le4(offset,eocd,16);
  const all=[...local,...central,eocd],total=all.reduce((s,a)=>s+a.length,0);
  const out=new Uint8Array(total);let pos=0;for(const a of all){out.set(a,pos);pos+=a.length;}
  return new Blob([out],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
}

// ─── DOCX builder ────────────────────────────────────────────────────────
function generateDocx(data) {
  const T="F5C400",G="555555";
  const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const para=(text,o={})=>{const sz=o.size||21,b=o.bold?"<w:b/>":"",i=o.italic?"<w:i/>":"",c=o.color?`<w:color w:val="${o.color}"/>`:"";const sp=o.spaceBefore?`<w:spacing w:before="${o.spaceBefore}" w:after="${o.spaceAfter!==undefined?o.spaceAfter:80}"/>`:`<w:spacing w:after="${o.spaceAfter!==undefined?o.spaceAfter:80}"/>`;return`<w:p><w:pPr>${sp}</w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/>${b}${i}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>${c}</w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`;};
  const h=t=>para(t,{bold:true,size:26,color:T,spaceBefore:240,spaceAfter:120});
  const bl=t=>`<w:p><w:pPr><w:spacing w:after="60"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr><w:t xml:space="preserve">${esc(t)}</w:t></w:r></w:p>`;
  const rule=()=>`<w:p><w:pPr><w:spacing w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="12" w:space="1" w:color="${T}"/></w:pBdr></w:pPr></w:p>`;
  const sp=()=>`<w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>`;
  const{title,team,level,location,jobNumber,roleIntro,responsibilities,requirements,preferredQuals,hasPreferred}=data;
  const parts=[
    `<w:p><w:pPr><w:spacing w:after="80"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="52"/><w:szCs w:val="52"/><w:color w:val="${T}"/></w:rPr><w:t>${esc(`${level} ${title}`)}</w:t></w:r></w:p>`,
    rule(),para(`${location}  |  ${team}${jobNumber?"  |  Job #"+jobNumber:""}`,{size:20,color:G,spaceAfter:200}),
    para("Let's make an impact on tomorrow's battlefield.",{italic:true,spaceAfter:40}),
    para("FUSE is where cutting-edge defense technology meets real-world impact.",{italic:true,spaceAfter:40}),
    para("We're redefining man unmanned teaming (MUM-T) through a unified, intelligent ecosystem that connects autonomous and robotic platforms across land and air.",{italic:true,spaceAfter:0}),
    sp(),para("We are looking for",{bold:true,spaceAfter:80}),para(roleIntro,{spaceAfter:0}),sp(),
    h("In this role you will"),...responsibilities.filter(r=>r.trim()).map(bl),sp(),
    h("Requirements"),...requirements.filter(r=>r.trim()).map(bl),
  ];
  if(hasPreferred&&preferredQuals.some(q=>q.trim())){parts.push(sp(),h("Preferred qualifications"));preferredQuals.filter(q=>q.trim()).forEach(q=>parts.push(bl(q)));}
  parts.push(sp(),para("This is your chance to be a part of a new and exciting opportunity, work on complex, high-stakes systems, push the boundaries of autonomy and robotics, and build technology that makes an instant impact.",{spaceAfter:80}),para("If you're looking to move fast, think big, and shape what comes next, we want you with us.",{italic:true,spaceAfter:0}),sp(),para("Only relevant applications will be answered**",{color:G,spaceAfter:40}),para(`${location}#`,{color:G,spaceAfter:0}));
  const docXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${parts.join("")}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`;
  const numXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="&#x2022;"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="21"/></w:rPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`;
  const stylesXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr></w:rPrDefault></w:docDefaults></w:styles>`;
  const ct=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`;
  const rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
  const wrels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>`;
  return buildZip({"[Content_Types].xml":ct,"_rels/.rels":rels,"word/document.xml":docXml,"word/styles.xml":stylesXml,"word/numbering.xml":numXml,"word/_rels/document.xml.rels":wrels});
}

// ─── API call (goes through /api/anthropic proxy) ────────────────────────
async function callAI(messages, tools) {
  const body = { model: "claude-sonnet-4-5", max_tokens: 1200, messages };
  if (tools) body.tools = tools;
  const res = await fetch("/api/anthropic", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error?.message || `API error ${res.status}`); }
  const data = await res.json();
  if (!data.content) throw new Error(data.error?.message || "No response from API");
  return data.content;
}

async function generateWithAI(formData, onStatus) {
  onStatus("✍️ Drafting job description…");
  const prompt = `You are a copywriter for FUSE, a defense-tech startup (subsidiary of Elbit Systems) building autonomous and robotic platforms for MUM-T. Bold, direct, human tone. No fluff.

Role: ${formData.level} ${formData.title} | Team: ${formData.team} | Location: ${formData.location}
Extra context: ${formData.notes||"none"}

Return ONLY valid JSON (no markdown):
{"roleIntro":"2-3 sentences: role context, tech stack, mission impact","responsibilities":["verb phrase"],"requirements":["req","req – advantage"],"preferredQuals":["pref – advantage"]}

Rules: responsibilities 6-8 items (action verbs); requirements 7-10 (last 2-3 end with – advantage); preferredQuals 2-4 (all end with – advantage); short sentences, active voice.`;
  const content = await callAI([{ role:"user", content:prompt }]);
  const text = content.map(i=>i.text||"").join("").replace(/```json|```/g,"").trim();
  return JSON.parse(text);
}

// ─── Shared JD boilerplate ───────────────────────────────────────────────
const MISSION_HOOK = [
  "Let's make an impact on tomorrow's battlefield.",
  "FUSE is where cutting-edge defense technology meets real-world impact.",
  "We're redefining man unmanned teaming (MUM-T) through a unified, intelligent ecosystem that connects autonomous and robotic platforms across land and air.",
];
const SIGNOFF = [
  "This is your chance to be a part of a new and exciting opportunity, work on complex, high-stakes systems, push the boundaries of autonomy and robotics, and build technology that makes an instant impact.",
  "If you're looking to move fast, think big, and shape what comes next, we want you with us.",
];

// ─── Refine with AI ──────────────────────────────────────────────────────
async function refineWithAI(currentData, instruction, onStatus) {
  onStatus("✍️ Refining job description…");
  const prompt = `You are a copywriter for FUSE, a defense-tech startup building autonomous/robotic platforms. Bold, direct, human tone. No fluff.

Current JD for ${currentData.level} ${currentData.title} | Team: ${currentData.team} | Location: ${currentData.location}:
roleIntro: ${currentData.roleIntro}
responsibilities: ${JSON.stringify(currentData.responsibilities)}
requirements: ${JSON.stringify(currentData.requirements)}
preferredQuals: ${JSON.stringify(currentData.preferredQuals)}

User instruction: "${instruction}"

Apply the instruction and return ONLY valid JSON (no markdown):
{"roleIntro":"...","responsibilities":[...],"requirements":[...],"preferredQuals":[...]}

Keep unchanged sections intact. Maintain FUSE tone: active voice, short sentences, no fluff. Nice-to-haves end with – advantage.`;
  const content = await callAI([{ role: "user", content: prompt }]);
  const text = content.map(i => i.text || "").join("").replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

// ─── JD Preview component ────────────────────────────────────────────────
function JDPreview({ title, level, team, location, jobNumber, roleIntro, responsibilities, requirements, hasPreferred, preferredQuals }) {
  const secHead = (text) => (
    <div style={{ fontFamily: "DM Mono,monospace", fontSize: 11, fontWeight: 500, color: TEAL, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10, marginTop: 22 }}>
      {text}
    </div>
  );
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "32px 36px", overflowY: "auto", maxHeight: 620 }}>
      <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 30, color: TEAL, lineHeight: 1.2, marginBottom: 10 }}>
        {level} {title}
      </div>
      <div style={{ height: 2, background: TEAL, marginBottom: 12 }} />
      <div style={{ fontFamily: "DM Mono,monospace", fontSize: 12, color: "#666", marginBottom: 24 }}>
        {location}{"  |  "}{team}{jobNumber ? `  |  Job #${jobNumber}` : ""}
      </div>
      {MISSION_HOOK.map((line, i) => (
        <p key={i} style={{ fontStyle: "italic", color: MUTED, fontSize: 13.5, lineHeight: 1.65, marginBottom: 6 }}>{line}</p>
      ))}
      <div style={{ height: 16 }} />
      <p style={{ fontWeight: 600, color: "#d4eeec", fontSize: 14, marginBottom: 8 }}>We are looking for</p>
      <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#d4eeec", marginBottom: 4 }}>{roleIntro}</p>
      {secHead("In this role you will")}
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        {responsibilities.filter(r => r.trim()).map((r, i) => (
          <li key={i} style={{ fontSize: 13.5, lineHeight: 1.75, color: "#d4eeec", marginBottom: 4 }}>{r}</li>
        ))}
      </ul>
      {secHead("Requirements")}
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        {requirements.filter(r => r.trim()).map((r, i) => (
          <li key={i} style={{ fontSize: 13.5, lineHeight: 1.75, color: "#d4eeec", marginBottom: 4 }}>{r}</li>
        ))}
      </ul>
      {hasPreferred && preferredQuals.some(q => q.trim()) && (
        <>
          {secHead("Preferred qualifications")}
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {preferredQuals.filter(q => q.trim()).map((q, i) => (
              <li key={i} style={{ fontSize: 13.5, lineHeight: 1.75, color: "#d4eeec", marginBottom: 4 }}>{q}</li>
            ))}
          </ul>
        </>
      )}
      <div style={{ height: 24 }} />
      <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#d4eeec", marginBottom: 10 }}>{SIGNOFF[0]}</p>
      <p style={{ fontSize: 13.5, lineHeight: 1.75, color: MUTED, fontStyle: "italic", marginBottom: 20 }}>{SIGNOFF[1]}</p>
      <p style={{ fontFamily: "DM Mono,monospace", fontSize: 11, color: "#555", marginBottom: 4 }}>Only relevant applications will be answered**</p>
      <p style={{ fontFamily: "DM Mono,monospace", fontSize: 11, color: "#555" }}>{location}#</p>
    </div>
  );
}

// ─── BulletEditor ────────────────────────────────────────────────────────
function BulletEditor({ items, onChange, placeholder }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {items.map((item,i)=>(
        <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
          <input value={item} onChange={e=>onChange(items.map((x,j)=>j===i?e.target.value:x))} placeholder={`${placeholder} ${i+1}`}
            style={{flex:1,background:CARD,border:`1px solid ${BORDER}`,borderRadius:6,color:"#d4eeec",fontSize:13.5,padding:"9px 14px",fontFamily:"Inter,sans-serif",outline:"none"}} />
          {items.length>1&&<button onClick={()=>onChange(items.filter((_,j)=>j!==i))}
            style={{width:28,height:28,borderRadius:4,border:`1px solid ${BORDER}`,background:"transparent",color:MUTED,cursor:"pointer",fontSize:16}}>×</button>}
        </div>
      ))}
      <button onClick={()=>onChange([...items,""])}
        style={{background:"transparent",border:`1px dashed ${BORDER}`,borderRadius:6,color:MUTED,cursor:"pointer",fontSize:12,padding:"8px 14px",textAlign:"left",fontFamily:"monospace"}}>+ Add item</button>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────
export default function App() {
  const [title,setTitle]=useState("");
  const [team,setTeam]=useState("Autonomy");
  const [level,setLevel]=useState("Senior");
  const [location,setLocation]=useState("Rosh HaAyin");
  const [jobNumber,setJobNumber]=useState("");
  const [notes,setNotes]=useState("");
  const [roleIntro,setRoleIntro]=useState("");
  const [responsibilities,setResponsibilities]=useState(["","",""]);
  const [requirements,setRequirements]=useState(["","",""]);
  const [hasPreferred,setHasPreferred]=useState(false);
  const [preferredQuals,setPreferredQuals]=useState(["",""]);
  const [status,setStatus]=useState(null);
  const [loading,setLoading]=useState(false);
  const [docxBlob,setDocxBlob]=useState(null);
  const [aiMode,setAiMode]=useState(true);
  const [marketInsights,setMarketInsights]=useState(null);
  const [showInsights,setShowInsights]=useState(false);
  const [refinementNote,setRefinementNote]=useState("");
  const [refining,setRefining]=useState(false);
  const previewRef=useRef(null);
  const [showJumpBadge,setShowJumpBadge]=useState(false);
  useEffect(()=>{
    if(!docxBlob){setShowJumpBadge(false);return;}
    setShowJumpBadge(true);
    if(!previewRef.current)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setShowJumpBadge(false);},{threshold:0.1});
    obs.observe(previewRef.current);
    return()=>obs.disconnect();
  },[docxBlob]);

  const field=(label,children)=>(
    <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
      <label style={{fontSize:11,fontWeight:500,color:"#7aada9",letterSpacing:"0.4px",textTransform:"uppercase",fontFamily:"monospace"}}>{label}</label>
      {children}
    </div>
  );
  const input=(val,set,ph)=><input value={val} onChange={e=>set(e.target.value)} placeholder={ph}
    style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:6,color:"#d4eeec",fontSize:14,padding:"10px 14px",fontFamily:"Inter,sans-serif",outline:"none",width:"100%"}}/>;
  const select=(val,set,opts)=><select value={val} onChange={e=>set(e.target.value)}
    style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:6,color:"#d4eeec",fontSize:14,padding:"10px 14px",fontFamily:"Inter,sans-serif",outline:"none",width:"100%",WebkitAppearance:"none"}}>
    {opts.map(o=><option key={o}>{o}</option>)}</select>;

  const sectionLabel=(text)=>(
    <div style={{fontFamily:"monospace",fontSize:10,fontWeight:500,letterSpacing:2,textTransform:"uppercase",color:TEAL,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
      {text}<div style={{flex:1,height:1,background:BORDER}}/>
    </div>
  );

  const handleGenerate = async () => {
    if (!title.trim()) { setStatus({type:"error",msg:"Role title is required."}); return; }
    setLoading(true); setDocxBlob(null); setMarketInsights(null); setShowInsights(false);
    setStatus({type:"loading",msg:"Starting…"});
    try {
      let ri=roleIntro,resp=responsibilities,reqs=requirements,pref=preferredQuals;
      if (aiMode) {
        const ai = await generateWithAI({title,team,level,location,notes},(msg)=>setStatus({type:"loading",msg}));
        ri=ai.roleIntro; resp=ai.responsibilities; reqs=ai.requirements; pref=ai.preferredQuals||[];
        setRoleIntro(ri); setResponsibilities(resp); setRequirements(reqs);
        if(pref.length){setHasPreferred(true);setPreferredQuals(pref);}
      }
      setStatus({type:"loading",msg:"Building .docx…"});
      const blob = generateDocx({title,team,level,location,jobNumber,roleIntro:ri||`A ${level} ${title} to join our team.`,responsibilities:resp.filter(r=>r.trim()),requirements:reqs.filter(r=>r.trim()),preferredQuals:pref.filter(q=>q.trim()),hasPreferred});
      setDocxBlob(blob);
      setStatus({type:"success",msg:"Document ready — click to download."});
    } catch(err) {
      setStatus({type:"error",msg:err.message});
    } finally { setLoading(false); }
  };

  const handleDownload = () => {
    if(!docxBlob) return;
    const url=URL.createObjectURL(docxBlob),a=document.createElement("a");
    a.href=url; a.download=`FUSE_JD_${level}_${title}_${new Date().toISOString().slice(0,10)}.docx`.replace(/\s+/g,"_");
    a.click(); URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const data = { title, level, team, location, jobNumber, roleIntro, responsibilities, requirements, hasPreferred, preferredQuals };
    const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
    window.open(`/view?data=${encodeURIComponent(encoded)}`, "_blank");
  };

  const handleRefine = async () => {
    if (!refinementNote.trim()) return;
    setRefining(true);
    try {
      const ai = await refineWithAI(
        { level, title, team, location, roleIntro, responsibilities, requirements, preferredQuals },
        refinementNote,
        (msg) => setStatus({ type: "loading", msg })
      );
      const ri = ai.roleIntro || roleIntro;
      const resp = ai.responsibilities || responsibilities;
      const reqs = ai.requirements || requirements;
      const pref = ai.preferredQuals || preferredQuals;
      setRoleIntro(ri); setResponsibilities(resp); setRequirements(reqs);
      if (pref.length) { setHasPreferred(true); setPreferredQuals(pref); }
      const blob = generateDocx({ title, team, level, location, jobNumber, roleIntro: ri, responsibilities: resp.filter(r => r.trim()), requirements: reqs.filter(r => r.trim()), preferredQuals: pref.filter(q => q.trim()), hasPreferred: pref.length > 0 || hasPreferred });
      setDocxBlob(blob);
      setStatus({ type: "success", msg: "Refined — document updated." });
      setRefinementNote("");
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setRefining(false);
    }
  };

  const toggleStyle={width:36,height:20,borderRadius:10,background:BORDER,position:"relative",transition:"background 0.2s",flexShrink:0,cursor:"pointer"};

  return (
    <>
      <Head><title>FUSE JD Generator</title><link rel="preconnect" href="https://fonts.googleapis.com"/><link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/></Head>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:${DARK};color:#d4eeec;font-family:Inter,sans-serif;min-height:100vh}select option{background:#1a2b29}input::placeholder,textarea::placeholder{color:${MUTED}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes badgeFadeIn{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes badgeBounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-7px)}}`}</style>

      <div style={{maxWidth:820,margin:"0 auto",padding:"40px 24px 80px"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",gap:20,marginBottom:48,paddingBottom:32,borderBottom:`1px solid ${BORDER}`}}>
          <div style={{flexShrink:0,display:"flex",alignItems:"center"}}>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="26,2 34,18 52,18 38,30 44,48 26,38 8,48 14,30 0,18 18,18" fill="#F5C400"/>
              <polygon points="26,10 31,20 42,20 33,27 37,38 26,31 15,38 19,27 10,20 21,20" fill="#1a1400"/>
            </svg>
          </div>
          <div>
            <h1 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:26,letterSpacing:"-0.5px"}}><span style={{color:"#F5C400"}}>FUSE</span> <span style={{color:"#fff"}}>JD Generator</span></h1>
            <p style={{fontSize:13,color:MUTED,marginTop:6,fontWeight:300}}>FUSE · Defense Autonomy & Robotics · Elbit Systems</p>
            {process.env.NEXT_PUBLIC_VERSION&&<p style={{fontSize:10,color:"#2a4a48",marginTop:4,fontFamily:"monospace",letterSpacing:"0.5px"}}>{process.env.NEXT_PUBLIC_VERSION}</p>}
          </div>
        </div>

        {/* Role */}
        <div style={{marginBottom:36}}>
          {sectionLabel("Role")}
          {field("Job Title *", input(title,setTitle,"e.g. Autonomy Software Engineer"))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
            {field("Level",select(level,setLevel,LEVELS))}
            {field("Team",select(team,setTeam,TEAMS))}
            {field("Location",select(location,setLocation,LOCATIONS))}
          </div>
        </div>

        {/* Content */}
        <div style={{marginBottom:36}}>
          {sectionLabel("Content")}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,cursor:"pointer"}} onClick={()=>setAiMode(v=>!v)}>
            <div style={{...toggleStyle,background:aiMode?TEAL:BORDER}}>
              <div style={{position:"absolute",width:14,height:14,borderRadius:"50%",background:"#fff",top:3,left:aiMode?19:3,transition:"left 0.2s"}}/>
            </div>
            <span style={{fontSize:13,color:"#7aada9"}}>{aiMode?"AI drafts content (searches live job postings for benchmarks)":"Manual — fill in everything yourself"}</span>
          </div>
          {aiMode ? field("Brief / Context for AI (optional)",
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="e.g. Focus on SLAM and ROS2. Lead managing 3 engineers."
              style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:6,color:"#d4eeec",fontSize:14,padding:"10px 14px",fontFamily:"Inter,sans-serif",outline:"none",width:"100%",minHeight:90,resize:"vertical",lineHeight:1.6}}/>
          ) : (
            <>
              {field("Role Introduction",<textarea value={roleIntro} onChange={e=>setRoleIntro(e.target.value)} placeholder="2-3 sentences describing the role context and opportunity at FUSE…" style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:6,color:"#d4eeec",fontSize:14,padding:"10px 14px",fontFamily:"Inter,sans-serif",outline:"none",width:"100%",minHeight:100,resize:"vertical",lineHeight:1.6}}/>)}
              {field("Responsibilities",<BulletEditor items={responsibilities} onChange={setResponsibilities} placeholder="Responsibility"/>)}
              {field("Requirements",<BulletEditor items={requirements} onChange={setRequirements} placeholder="Requirement"/>)}
              <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:hasPreferred?12:0}} onClick={()=>setHasPreferred(v=>!v)}>
                <div style={{...toggleStyle,background:hasPreferred?TEAL:BORDER}}><div style={{position:"absolute",width:14,height:14,borderRadius:"50%",background:"#fff",top:3,left:hasPreferred?19:3,transition:"left 0.2s"}}/></div>
                <span style={{fontSize:13,color:"#7aada9"}}>Add preferred qualifications section</span>
              </div>
              {hasPreferred&&<BulletEditor items={preferredQuals} onChange={setPreferredQuals} placeholder="Preferred qualification"/>}
            </>
          )}
        </div>

        {/* Optional */}
        <div style={{marginBottom:36}}>
          {sectionLabel("Optional")}
          <div style={{maxWidth:200}}>{field("Job Number",input(jobNumber,setJobNumber,"e.g. 4510"))}</div>
        </div>

        {/* Generate */}
        <div style={{position:"sticky",bottom:0,background:`linear-gradient(to top, ${DARK} 80%, transparent)`,paddingTop:24,marginTop:40}}>
          <button onClick={handleGenerate} disabled={loading}
            style={{width:"100%",background:TEAL,border:"none",borderRadius:8,color:DARK,cursor:loading?"not-allowed":"pointer",fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:15,padding:16,opacity:loading?0.5:1,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            {loading ? <>
              <div style={{width:14,height:14,border:"2px solid rgba(0,0,0,0.3)",borderTopColor:DARK,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
              Generating…
            </> : <>⚡ Generate Job Description</>}
          </button>

          {status&&(
            <div style={{background:status.type==="error"?"#1a0a0a":status.type==="success"?"#0a1f18":CARD,border:`1px solid ${status.type==="error"?"#4a1a1a":status.type==="success"?"#1a3d30":BORDER}`,borderRadius:8,padding:"14px 18px",marginTop:16,fontFamily:"monospace",fontSize:12,color:status.type==="error"?"#ff8080":status.type==="success"?"#7aedc5":TEAL,display:"flex",alignItems:"center",gap:10}}>
              {status.type==="loading"&&<div style={{width:14,height:14,border:"2px solid rgba(245,196,0,0.3)",borderTopColor:"#F5C400",borderRadius:"50%",animation:"spin 0.7s linear infinite",flexShrink:0}}/>}
              {status.type==="success"&&"✓"}{status.type==="error"&&"✕"}
              <span>{status.msg}</span>
            </div>
          )}

          {docxBlob&&(
            <div style={{display:"flex",gap:10,marginTop:10}}>
              <button onClick={handleDownload}
                style={{background:"transparent",border:`1px solid ${TEAL}`,borderRadius:6,color:TEAL,cursor:"pointer",fontFamily:"monospace",fontSize:12,padding:"8px 16px",display:"flex",alignItems:"center",gap:6}}>
                ↓ Download .docx
              </button>
              <button onClick={handleShare}
                style={{background:"transparent",border:`1px solid ${BORDER}`,borderRadius:6,color:"#7aada9",cursor:"pointer",fontFamily:"monospace",fontSize:12,padding:"8px 16px",display:"flex",alignItems:"center",gap:6}}>
                ↗ Share
              </button>
            </div>
          )}

          {marketInsights&&(
            <>
              <button onClick={()=>setShowInsights(v=>!v)}
                style={{background:"transparent",border:"none",color:MUTED,fontFamily:"monospace",fontSize:11,cursor:"pointer",padding:"6px 0",display:"flex",alignItems:"center",gap:6,marginTop:8}}>
                {showInsights?"▲ Hide":"▼ Show"} market research used for qualifications
              </button>
              {showInsights&&(
                <div style={{background:"#0d1917",border:`1px solid ${BORDER}`,borderLeft:"2px solid #F5C400",borderRadius:6,padding:"14px 16px",marginTop:8,fontSize:12,lineHeight:1.7,color:"#6aaba6",fontFamily:"monospace",whiteSpace:"pre-wrap",maxHeight:220,overflowY:"auto"}}>
                  {marketInsights}
                </div>
              )}
            </>
          )}
        </div>

        {docxBlob&&(
          <div ref={previewRef} style={{marginTop:8,paddingBottom:80}}>
            <JDPreview title={title} level={level} team={team} location={location} jobNumber={jobNumber} roleIntro={roleIntro} responsibilities={responsibilities} requirements={requirements} hasPreferred={hasPreferred} preferredQuals={preferredQuals}/>
            <div style={{marginTop:14,display:"flex",gap:10,alignItems:"flex-start"}}>
              <textarea value={refinementNote} onChange={e=>setRefinementNote(e.target.value)} placeholder="Tell the AI what to change… e.g. Make the tone more senior, add Python to requirements"
                style={{flex:1,background:CARD,border:`1px solid ${BORDER}`,borderRadius:6,color:"#d4eeec",fontSize:13.5,padding:"10px 14px",fontFamily:"Inter,sans-serif",outline:"none",minHeight:52,resize:"vertical",lineHeight:1.5}}/>
              <button onClick={handleRefine} disabled={refining||!refinementNote.trim()}
                style={{background:"transparent",border:`1px solid ${TEAL}`,borderRadius:6,color:TEAL,cursor:refining||!refinementNote.trim()?"not-allowed":"pointer",fontFamily:"monospace",fontSize:12,padding:"12px 18px",opacity:refining||!refinementNote.trim()?0.45:1,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                {refining?<><div style={{width:12,height:12,border:"2px solid rgba(245,196,0,0.3)",borderTopColor:TEAL,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>Refining…</>:"↻ Refine"}
              </button>
            </div>
          </div>
        )}
      </div>

      {showJumpBadge&&(
        <div onClick={()=>{previewRef.current?.scrollIntoView({behavior:"smooth",block:"start"});}}
          style={{position:"fixed",bottom:88,left:"50%",background:TEAL,color:DARK,borderRadius:20,padding:"8px 20px",fontFamily:"monospace",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,zIndex:100,userSelect:"none",boxShadow:"0 4px 20px rgba(245,196,0,0.4)",animation:"badgeFadeIn 0.3s ease forwards, badgeBounce 1.4s ease 0.3s infinite"}}>
          ↓ Preview ready
        </div>
      )}
    </>
  );
}
