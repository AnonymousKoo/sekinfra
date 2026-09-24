import{ImageResponse}from"next/og";

export const alt="Sekinfra — We build and fix the systems your business runs on.";
export const size={width:1200,height:630};
export const contentType="image/png";

export default function OpenGraphImage(){
  return new ImageResponse(
    <div style={{height:"100%",width:"100%",display:"flex",background:"#f6f6f1",color:"#10251f",padding:"72px",fontFamily:"sans-serif"}}>
      <div style={{display:"flex",flexDirection:"column",justifyContent:"space-between",width:"100%"}}>
        <div style={{display:"flex",fontSize:34,fontWeight:800,letterSpacing:"-2px"}}>
          <span>sek</span><span style={{color:"#0e5b47"}}>infra</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:48}}>
          <div style={{display:"flex",flexDirection:"column",gap:24,maxWidth:760}}>
            <div style={{display:"flex",fontSize:66,fontWeight:700,letterSpacing:"-4px",lineHeight:1.03}}>
              We build and fix the systems your business runs on.
            </div>
            <div style={{display:"flex",fontSize:22,color:"#52645c"}}>
              Operations · Automation · Cloud & Network · Security · Business Systems
            </div>
          </div>
          <div style={{width:250,height:250,background:"#073f32",borderRadius:24,display:"flex",flexDirection:"column",justifyContent:"center",padding:32,gap:26}}>
            {["Symptom","Diagnosis","Outcome"].map((item,index)=><div key={item} style={{display:"flex",alignItems:"center",gap:16,color:"white",fontSize:18}}>
              <div style={{width:14,height:14,borderRadius:14,background:index===2?"#d7e66f":"#8fb5a7"}}/>
              <span>{item}</span>
            </div>)}
          </div>
        </div>
      </div>
    </div>,
    {...size}
  );
}
