
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bot, MessageSquare } from "lucide-react";

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
            <p className="text-muted-foreground text-lg mb-8">
                Your guide to placing an order with Darpan Wears. आपका दर्पण वेयर्स के साथ ऑर्डर देने के लिए गाइड।
            </p>

            <div className="space-y-12">
                
                <div className="p-6 border rounded-lg bg-card shadow-sm">
                    <h2 className="text-2xl font-bold font-headline mb-4">Ordering Instructions</h2>
                    <p className="text-muted-foreground mb-4">(Coming Soon) Detailed steps with images will be added here in both English and Hindi.</p>
                </div>

                <div className="p-6 border-2 border-dashed rounded-lg bg-primary/5 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <Bot className="h-12 w-12 text-primary" />
                        <h2 className="text-3xl font-bold font-headline text-primary">Darpan 2.0 AI Assistant</h2>
                        <p className="text-muted-foreground max-w-md">
                            Have questions? Ask our AI assistant, Darpan 2.0, for help with ordering, products, or anything else!
                        </p>
                        <Button size="lg" className="mt-4">
                            <MessageSquare className="mr-2" /> Talk to Darpan 2.0 (Coming Soon)
                        </Button>
                    </div>
                </div>
                
            </div>
        </div>
      </main>
    </div>
  );
}
