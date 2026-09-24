import type{Metadata}from"next";
import{Geist,Instrument_Serif}from"next/font/google";
import"./globals.css";
import{PersonalizationProvider}from"@/components/personalization-provider";

const geistSans=Geist({variable:"--font-geist-sans",subsets:["latin"]});
const instrumentSerif=Instrument_Serif({variable:"--font-display",weight:"400",subsets:["latin"]});

export const metadata:Metadata={
  metadataBase:new URL("https://www.sekinfra.com"),
  title:{
    default:"Sekinfra | We build and fix the systems your business runs on",
    template:"%s | Sekinfra"
  },
  description:"Sekinfra diagnoses and improves the operational and technical systems businesses depend on—from workflows and automation to cloud, network, security, and business systems.",
  applicationName:"Sekinfra",
  openGraph:{
    type:"website",
    locale:"en_US",
    siteName:"Sekinfra",
    title:"Sekinfra | We build and fix the systems your business runs on",
    description:"Bring us the problem. Sekinfra establishes what is actually happening before deciding what should be repaired, connected, secured, automated, or redesigned.",
    url:"https://www.sekinfra.com"
  },
  twitter:{
    card:"summary_large_image",
    title:"Sekinfra | We build and fix the systems your business runs on",
    description:"Operations, automation, cloud, network, security, and business systems—diagnosed before they are changed."
  },
  robots:{index:true,follow:true}
};

export default function RootLayout({children}:LayoutProps<"/">){
  return <html lang="en" className={`${geistSans.variable} ${instrumentSerif.variable} h-full antialiased`}>
    <body className="min-h-full flex flex-col">
      <PersonalizationProvider>{children}</PersonalizationProvider>
    </body>
  </html>
}
