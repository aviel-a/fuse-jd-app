import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const TEAL = "#F5C400";

const ABOUT_FUSE_PARAS = [
  "FUSE is building the next generation of autonomous defense technology: intelligent robotic systems and multi-domain platforms that redefine how forces operate, sense, decide, and act. Our systems work alongside human operators for surveillance, strike, and mission support.",
  "At FUSE, we bring together industry pioneers into one agile organization under Elbit Systems, combining the speed, sense of ownership, and innovation culture of a startup with the manufacturing power and operational strength of a global defense leader. Our teams own the full stack end-to-end, from mechanical design, hardware, and embedded systems to robotics, autonomy, AI, and real-time multi-platform decision-making.",
  "Here, technology goes from concept to operational deployment. Fast. Your work doesn't sit in a backlog. It takes off.",
];
const SIGNOFF = [
  "This is your chance to be a part of a new and exciting opportunity, work on complex, high-stakes systems, push the boundaries of autonomy and robotics, and build technology that makes an instant impact.",
  "If you're looking to move fast, think big, and shape what comes next, we want you with us.",
];

function SectionHead({ children }) {
  return (
    <div style={{ fontFamily: "DM Mono,monospace", fontSize: 11, fontWeight: 500, color: "#1a1a1a", letterSpacing: "1.5px", textTransform: "uppercase", borderLeft: `3px solid ${TEAL}`, paddingLeft: 10, marginBottom: 12, marginTop: 4 }}>
      {children}
    </div>
  );
}

export default function ViewPage() {
  const router = useRouter();
  const [jd, setJd] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    const { data } = router.query;
    if (!data) { setError("No job description data found in this link."); return; }
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(String(data))));
      setJd(decoded);
    } catch {
      setError("Invalid or corrupted share link.");
    }
  }, [router.isReady, router.query]);

  if (error) return (
    <div style={{ fontFamily: "Inter,sans-serif", padding: 40, color: "#333" }}>
      <p style={{ color: "#cc0000" }}>{error}</p>
    </div>
  );

  if (!jd) return (
    <div style={{ fontFamily: "Inter,sans-serif", padding: 40, color: "#333", fontSize: 14 }}>
      Loading…
    </div>
  );

  return (
    <>
      <Head>
        <title>{jd.level} {jd.title} — FUSE</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; color: #1a1a1a; font-family: Inter, sans-serif; }
        ul { list-style: disc; }
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Print / PDF button */}
      <div className="no-print" style={{ position: "fixed", top: 20, right: 24, zIndex: 10, display: "flex", gap: 10 }}>
        <button onClick={() => window.print()}
          style={{ background: TEAL, border: "none", borderRadius: 6, color: "#0a0f0e", cursor: "pointer", fontFamily: "DM Mono,monospace", fontSize: 12, fontWeight: 500, padding: "10px 18px", display: "flex", alignItems: "center", gap: 6 }}>
          ⎙ Print / Save PDF
        </button>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 40px 80px" }}>

        {/* Header branding */}
        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48, paddingBottom: 24, borderBottom: "1px solid #eee" }}>
          <svg width="36" height="36" viewBox="0 0 52 52" fill="none">
            <polygon points="26,2 34,18 52,18 38,30 44,48 26,38 8,48 14,30 0,18 18,18" fill="#F5C400" />
            <polygon points="26,10 31,20 42,20 33,27 37,38 26,31 15,38 19,27 10,20 21,20" fill="#fff" />
          </svg>
          <div>
            <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 17, color: "#1a1a1a" }}>FUSE</span>
            <span style={{ fontFamily: "DM Mono,monospace", fontSize: 11, color: "#aaa", marginLeft: 10 }}>Job Description</span>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 38, color: "#1a1a1a", lineHeight: 1.15, marginBottom: 12 }}>
          {jd.level} {jd.title}
        </h1>
        <div style={{ height: 3, background: TEAL, marginBottom: 14 }} />
        <div style={{ fontFamily: "DM Mono,monospace", fontSize: 12, color: "#888", marginBottom: 36 }}>
          {jd.location}{"  |  "}{jd.team}{jd.jobNumber ? `  |  Job #${jd.jobNumber}` : ""}
        </div>

        {/* About FUSE */}
        {ABOUT_FUSE_PARAS.map((p,i)=>(
          <p key={i} style={{ fontSize:14.5, lineHeight:1.75, color:"#333", marginBottom:i<ABOUT_FUSE_PARAS.length-1?16:28 }}>{p}</p>
        ))}

        {/* We are looking for */}
        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 10, color: "#1a1a1a" }}>We are looking for</p>
        <p style={{ fontSize: 14.5, lineHeight: 1.75, color: "#333", marginBottom: 28 }}>{jd.roleIntro}</p>

        {/* Responsibilities */}
        <SectionHead>In this role you will</SectionHead>
        <ul style={{ paddingLeft: 22, marginBottom: 24 }}>
          {(jd.responsibilities || []).filter(r => r.trim()).map((r, i) => (
            <li key={i} style={{ fontSize: 14.5, lineHeight: 1.75, color: "#333", marginBottom: 5 }}>{r}</li>
          ))}
        </ul>

        {/* Requirements */}
        <SectionHead>Requirements</SectionHead>
        <ul style={{ paddingLeft: 22, marginBottom: 24 }}>
          {(jd.requirements || []).filter(r => r.trim()).map((r, i) => (
            <li key={i} style={{ fontSize: 14.5, lineHeight: 1.75, color: "#333", marginBottom: 5 }}>{r}</li>
          ))}
        </ul>

        {/* Preferred qualifications */}
        {jd.hasPreferred && (jd.preferredQuals || []).some(q => q.trim()) && (
          <>
            <SectionHead>Preferred qualifications</SectionHead>
            <ul style={{ paddingLeft: 22, marginBottom: 24 }}>
              {jd.preferredQuals.filter(q => q.trim()).map((q, i) => (
                <li key={i} style={{ fontSize: 14.5, lineHeight: 1.75, color: "#333", marginBottom: 5 }}>{q}</li>
              ))}
            </ul>
          </>
        )}

        <div style={{ height: 24 }} />

        {/* Sign-off */}
        <p style={{ fontSize: 14.5, lineHeight: 1.75, color: "#333", marginBottom: 12 }}>{SIGNOFF[0]}</p>
        <p style={{ fontSize: 14.5, lineHeight: 1.75, color: "#666", fontStyle: "italic", marginBottom: 36 }}>{SIGNOFF[1]}</p>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #eee", paddingTop: 20 }}>
          <p style={{ fontFamily: "DM Mono,monospace", fontSize: 11, color: "#bbb", marginBottom: 4 }}>Only relevant applications will be answered**</p>
          <p style={{ fontFamily: "DM Mono,monospace", fontSize: 11, color: "#bbb" }}>{jd.location}#</p>
        </div>
      </div>
    </>
  );
}
