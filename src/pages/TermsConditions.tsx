import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Gavel, UserCheck, CreditCard, ShieldAlert, FileText, HelpCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsConditions() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: Gavel,
      content: [
        { subtitle: "Agreement", text: "By accessing or using PetSaathi, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services." },
        { subtitle: "Eligibility", text: "You must be at least 18 years old and capable of forming a binding contract to use PetSaathi." }
      ]
    },
    {
      title: "2. User Responsibilities",
      icon: UserCheck,
      content: [
        { subtitle: "Account Accuracy", text: "You are responsible for maintaining the accuracy of your profile and pet information. Misleading data may lead to account suspension." },
        { subtitle: "Pet Safety", text: "Pet parents must ensure pets are vaccinated and disclose any aggressive tendencies or medical conditions before booking a service." }
      ]
    },
    {
      title: "3. Service Fees & Payments",
      icon: CreditCard,
      content: [
        { subtitle: "secure Payments", text: "All payments must be made through our secure integrated payment gateway (Razorpay). Direct cash transactions outside the platform are prohibited." },
        { subtitle: "Platform Fee", text: "PetSaathi may charge a service fee for facilitating connections. These fees are non-refundable once the service is initiated." }
      ]
    },
    {
      title: "4. Limitation of Liability",
      icon: ShieldAlert,
      content: [
        { subtitle: "Nature of Platform", text: "PetSaathi is a technology aggregator. We do not directly employ service providers and are not liable for their individual actions or service quality." },
        { subtitle: "Assumption of Risk", text: "Users acknowledge the inherent risks in pet-care services and agree to hold PetSaathi harmless for incidental damages or injuries." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20 pb-20">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200 shadow-sm transition-all h-16 flex items-center">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
             <span className="text-xl font-black text-primary tracking-tighter">PetSaathi</span>
          </Link>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")} 
            className="text-slate-500 hover:text-primary gap-2 rounded-xl h-9"
          >
            <ArrowLeft size={16} /> Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-32 max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Title Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase italic">Terms of <span className="text-primary NOT-italic">Engagement</span></h1>
          <p className="text-slate-500 font-medium">Effective Date: March 19, 2026</p>
          <div className="flex justify-center pt-2">
             <div className="h-1.5 w-20 bg-primary rounded-full" />
          </div>
        </div>

        {/* Ecosystem Notice */}
        <Card className="border-none shadow-sm rounded-3xl bg-slate-900 overflow-hidden text-white relative">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <FileText size={120} />
           </div>
          <CardContent className="p-8 md:p-10 flex gap-6 items-start relative z-10">
             <div className="bg-primary/20 p-3 rounded-2xl text-primary hidden sm:block">
                <HelpCircle size={24} />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Platform Charter</h3>
                <p className="text-md font-medium text-slate-400 leading-relaxed italic">
                   PetSaathi provides a marketplace for high-trust connections. By using our platform, you join a community built on mutual respect and pet-first values.
                </p>
             </div>
          </CardContent>
        </Card>

        {/* Detailed Sections */}
        <div className="space-y-10">
           {sections.map((section, idx) => (
             <section key={idx} className="space-y-6">
                <div className="flex items-center gap-4 pl-2">
                   <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-100">
                      <section.icon size={20} />
                   </div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{section.title}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {section.content.map((item, i) => (
                     <Card key={i} className="border-none shadow-sm rounded-2xl bg-white border border-slate-100/50 hover:border-primary/20 transition-all">
                        <CardContent className="p-6 md:p-8">
                           <h4 className="text-xs font-black uppercase text-primary tracking-widest mb-3 italic">{item.subtitle}</h4>
                           <p className="text-slate-600 font-medium text-[13px] leading-relaxed">{item.text}</p>
                        </CardContent>
                     </Card>
                   ))}
                </div>
             </section>
           ))}
        </div>

        {/* Termination Section */}
        <Card className="border-none shadow- प्रीमियम bg-rose-50 rounded-3xl overflow-hidden border-l-4 border-rose-500">
          <CardContent className="p-8 md:p-10 flex gap-6 items-center">
             <div className="bg-rose-500 p-3 rounded-2xl text-white">
                <AlertTriangle size={24} />
             </div>
             <div className="space-y-1">
                <h3 className="text-lg font-bold text-rose-900 uppercase tracking-tight">Termination of Service</h3>
                <p className="text-sm font-medium text-rose-700/80 leading-relaxed">
                   We reserve the right to suspend or terminate accounts that violate our safety protocols or community guidelines without prior notice.
                </p>
             </div>
          </CardContent>
        </Card>
      </main>

      <footer className="text-center py-12 text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] mt-10">
         © 2026 PetSaathi • Constitutional Standards Core
      </footer>
    </div>
  );
}
