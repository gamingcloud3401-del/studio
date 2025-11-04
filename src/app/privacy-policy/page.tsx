
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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

          <h1 className="text-4xl font-bold font-headline mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose dark:prose-invert max-w-none text-muted-foreground">
            <p>Welcome to Darpan Wears. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-2 text-foreground">1. Information We Collect</h2>
            <p>We may collect personal information from you, such as your name, shipping address, email address, and telephone number, when you place an order.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-2 text-foreground">2. Use of Your Information</h2>
            <p>We use the information we collect to process your orders, communicate with you about your order, and to provide you with a personalized shopping experience.</p>

            <h2 className="text-2xl font-bold font-headline mt-8 mb-2 text-foreground">3. Security of Your Information</h2>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>
            
            <h2 className="text-2xl font-bold font-headline mt-8 mb-2 text-foreground">4. Contact Us</h2>
            <p>If you have questions or comments about this Privacy Policy, please contact us through our Instagram page or the contact information provided on the website.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
