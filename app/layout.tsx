import type{Metadata}from"next";
import{Geist,Instrument_Serif}from"next/font/google";
import"./globals.css";
import{PersonalizationProvider}from"@/components/personalization-provider";

const geistSans=Geist({variable:"--font-geist-sans",subsets:["latin"]});
const instrumentSerif=Instrument_Serif({variable:"--font-display",weight:"400",subsets:["latin"]});

export const metadata:Metadata={
  metadataBase:new URL("https://www.sekinfra.com"),
  title:{
    default:"Sekinfra | Technology & operations, working together",
    template:"%s | Sekinfra"
  },
  description:"Sekinfra helps your business work better together through reliable IT, networks and cloud, clearer workflows, and practical, permitted automation.",
  applicationName:"Sekinfra",
  openGraph:{
    type:"website",
    locale:"en_US",
    siteName:"Sekinfra",
    title:"Sekinfra | Technology & operations, working together",
    description:"We make the different parts of your business work better together. Keep what works and improve what is missing.",
    url:"https://www.sekinfra.com"
  },
  twitter:{
    card:"summary_large_image",
    title:"Sekinfra | Technology & operations, working together",
    description:"Reliable IT, networks and cloud. Clearer workflows. Practical automation. Evidence before separately approved changes."
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
