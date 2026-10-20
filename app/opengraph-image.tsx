import{ImageResponse}from"next/og";

export const alt="Sekinfra — We make the different parts of your business work better together.";
export const size={width:1200,height:630};
export const contentType="image/png";

export default function OpenGraphImage(){
  return new ImageResponse(
    <div style={{height:"100%",width:"100%",display:"flex",background:"#091217",color:"#f5f8f8",padding:"72px",fontFamily:"sans-serif"}}>
      <div style={{display:"flex",flexDirection:"column",justifyContent:"space-between",width:"100%"}}>
        <div style={{display:"flex",fontSize:34,fontWeight:800,letterSpacing:"-2px"}}>
          <span>sek</span><span style={{color:"#5fe0d5"}}>infra</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:48}}>
          <div style={{display:"flex",flexDirection:"column",gap:24,maxWidth:760}}>
            <div style={{display:"flex",fontSize:60,fontWeight:700,letterSpacing:"-4px",lineHeight:1.03}}>
              We make the different parts of your business work better together.
            </div>
            <div style={{display:"flex",fontSize:22,color:"#9fb1b6"}}>
              Reliable IT · Network & Cloud · Clearer Workflows · Practical Automation
            </div>
          </div>
          <div style={{width:250,height:250,background:"#101a21",borderRadius:24,display:"flex",flexDirection:"column",justifyContent:"center",padding:32,gap:26}}>
            {["Understand","Prioritize","Improve"].map((item,index)=><div key={item} style={{display:"flex",alignItems:"center",gap:16,color:"white",fontSize:18}}>
              <div style={{width:14,height:14,borderRadius:14,background:index===2?"#b9ef70":"#5fe0d5"}}/>
              <span>{item}</span>
            </div>)}
          </div>
        </div>
      </div>
    </div>,
    {...size}
  );
}
