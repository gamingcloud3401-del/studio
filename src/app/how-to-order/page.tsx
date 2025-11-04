
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bot, MessageSquare, ShoppingCart, Info, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
    {
        icon: <ShoppingCart className="h-8 w-8 text-primary" />,
        title: "1. Browse & Select",
        title_hi: "१. ब्राउज़ करें और चुनें",
        description: "Explore our collection and click on any product you like to see more details.",
        description_hi: "हमारे संग्रह का अन्वेषण करें और अपनी पसंद के किसी भी उत्पाद पर अधिक विवरण देखने के लिए क्लिक करें।",
        image: "https://i.postimg.cc/kG8xzz7P/step1.gif"
    },
    {
        icon: <Info className="h-8 w-8 text-primary" />,
        title: "2. Check Details & Size",
        title_hi: "२. विवरण और आकार जांचें",
        description: "Review the product details, select your desired size, and click 'Order Now'.",
        description_hi: "उत्पाद विवरण की समीक्षा करें, अपना वांछित आकार चुनें, और 'अभी ऑर्डर करें' पर क्लिक करें।",
        image: "https://i.postimg.cc/tJnB9TjJ/step2.gif"
    },
    {
        icon: <Send className="h-8 w-8 text-primary" />,
        title: "3. Send on WhatsApp",
        title_hi: "३. व्हाट्सएप पर भेजें",
        description: "Fill in your details in the form and click 'Send Order on WhatsApp' to place your order directly with us.",
        description_hi: "फॉर्म में अपना विवरण भरें और सीधे हमारे साथ अपना ऑर्डर देने के लिए 'व्हाट्सएप पर ऑर्डर भेजें' पर क्लिक करें।",
        image: "https://i.postimg.cc/J4V0gQ9c/step3.gif"
    },
];

export default function HowToOrderPage() {
  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2 text-3xl font-bold text-primary font-headline">
              <Image src="https://i.postimg.cc/bvypQBy5/IMG-20251031-224943-060.webp" alt="Darpan Wears Logo" width={48} height={48} className="rounded-full" />
              <span>Darpan Wears</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                 <Button asChild variant="outline">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Link>
                </Button>
            </div>

            <h1 className="text-4xl font-bold font-headline mb-4">How to Order</h1>
            <p className="text-muted-foreground text-lg mb-12">
                Your guide to placing an order with Darpan Wears. आपका दर्पण वेयर्स के साथ ऑर्डर देने के लिए गाइड।
            </p>

            <div className="space-y-10">
                {steps.map((step, index) => (
                    <Card key={index} className="overflow-hidden shadow-lg border-primary/20">
                        <div className="grid md:grid-cols-2 items-center">
                            <div className="p-6 md:p-8 order-2 md:order-1">
                                <div className="flex items-center gap-4 mb-4">
                                    {step.icon}
                                    <div>
                                        <h2 className="text-2xl font-bold font-headline">{step.title}</h2>
                                        <h3 className="text-xl font-semibold font-headline text-primary">{step.title_hi}</h3>
                                    </div>
                                </div>
                                <p className="text-muted-foreground mb-2">{step.description}</p>
                                <p className="text-muted-foreground">{step.description_hi}</p>
                            </div>
                            <div className="order-1 md:order-2 bg-muted flex items-center justify-center p-4">
                                <Image src={step.image} alt={step.title} width={400} height={300} className="rounded-md shadow-md" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>


            <div className="mt-16 p-6 border-2 border-dashed rounded-lg bg-primary/5 text-center">
                <div className="flex flex-col items-center gap-4">
                    <Bot className="h-12 w-12 text-primary" />
                    <h2 className="text-3xl font-bold font-headline text-primary">Darpan 2.0 AI Assistant</h2>
                    <p className="text-muted-foreground max-w-md">
                        Have questions? Ask our AI assistant, Darpan 2.0, for help with ordering, products, or anything else!
                    </p>
                    <Button size="lg" className="mt-4" disabled>
                        <MessageSquare className="mr-2" /> Talk to Darpan 2.0 (Coming Soon)
                    </Button>
                </div>
            </div>
            
        </div>
      </main>
    </div>
  );
}
