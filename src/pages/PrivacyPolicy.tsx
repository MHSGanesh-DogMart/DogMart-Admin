import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Database, Info, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Information We Collect",
      icon: Database,
      content: [
        { subtitle: "Personal Information", text: "We collect your name, email address, phone number, and profile picture to create and manage your account." },
        { subtitle: "Pet Information", text: "Details about your pets, including name, breed, age, gender, and medical/behavioral notes, to ensure safe and personalized care." },
        { subtitle: "Location Data", text: "With your permission, we collect precise location data to show you nearby services and enable distance-based matching." }
      ]
    },
    {
      title: "2. How We Use Your Data",
      icon: Eye,
      content: [
        { subtitle: "Providing Services", text: "To facilitate bookings between pet parents and service providers and manage transactional workflows." },
        { subtitle: "Safety & Security", text: "To verify provider identities, prevent fraud, and ensure a high-trust environment for our community." },
        { subtitle: "Communication", text: "To send you booking updates, service notifications, and support messages related to your account." }
      ]
    },
    {
      title: "3. Data Sharing",
      icon: Shield,
      content: [
        { subtitle: "Service Providers", text: "Limited information (pet details, location, contact) is shared with providers only after you initiate a booking." },
        { subtitle: "No Selling", text: "We do NOT sell your personal data to third-party advertisers or data brokers. Your privacy is our priority." }
      ]
    },
    {
      title: "4. Data Security",
      icon: Lock,
      content: [
        { subtitle: "Encryption", text: "We use enterprise-grade encryption and secure Google Firebase infrastructure to protect your data at rest and in transit." },
        { subtitle: "Payments", text: "All financial transactions are handled securely by Razorpay. We do not store your credit card or banking credentials on our servers." }
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
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">Privacy Policy</h1>
          <p className="text-slate-500 font-medium">Last Updated: March 19, 2026</p>
          <div className="flex justify-center pt-2">
             <div className="h-1.5 w-20 bg-primary rounded-full" />
          </div>
        </div>

        {/* Introduction Card */}
        <Card className="border-none shadow-sm rounded-3xl bg-primary/5 border-2 border-primary/10 overflow-hidden">
          <CardContent className="p-8 md:p-10 flex gap-6 items-start">
             <div className="bg-primary/20 p-3 rounded-2xl text-primary hidden sm:block">
                <Info size={24} />
             </div>
             <p className="text-lg font-medium text-slate-700 leading-relaxed italic">
                At PetSaathi, your privacy is a fundamental right. We are committed to transparency about the data we collect and how we use it to provide the best possible care for your pets.
             </p>
          </CardContent>
        </Card>

        {/* Detailed Sections */}
        <div className="space-y-8">
           {sections.map((section, idx) => (
             <section key={idx} className="space-y-6">
                <div className="flex items-center gap-4 pl-2">
                   <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-100">
                      <section.icon size={20} />
                   </div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">{section.title}</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                   {section.content.map((item, i) => (
                     <Card key={i} className="border-none shadow-sm rounded-2xl bg-white border border-slate-100/50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6 md:p-8">
                           <h4 className="text-sm font-black uppercase text-primary tracking-widest mb-2">{item.subtitle}</h4>
                           <p className="text-slate-600 font-medium leading-relaxed">{item.text}</p>
                        </CardContent>
                     </Card>
                   ))}
                </div>
             </section>
           ))}
        </div>

        {/* Contact Section */}
        <section className="bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
           <div className="bg-primary/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-primary" />
           </div>
           <h3 className="text-3xl font-black">Questions or Concerns?</h3>
           <p className="text-slate-400 font-medium max-w-xl mx-auto italic leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please reach out to our privacy team at:
           </p>
           <div className="pt-4">
              <a href="mailto:hemanthtech517@gmail.com" className="text-2xl font-black text-primary hover:underline underline-offset-8">hemanthtech517@gmail.com</a>
           </div>
        </section>
      </main>

      <footer className="text-center py-12 text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] mt-10">
         © 2026 PetSaathi • Secure Infrastructure Core
      </footer>
    </div>
  );
}
