
import Image from 'next/image';
import { products } from '@/lib/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductDetailsDialog } from '@/components/product-details-dialog';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center sm:justify-start h-20">
            <Link href="/" className="flex items-center gap-2 text-3xl font-bold text-primary font-headline">
              <Image src="https://i.postimg.cc/bvypQBy5/IMG-20251031-224943-060.webp" alt="Darpan Wears Logo" width={48} height={48} className="rounded-full" />
              <span>Darpan Wears</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8 text-center font-headline">
            Our Collection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductDetailsDialog key={product.id} product={product}>
                <div className="group block cursor-pointer">
                  <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                    <CardHeader className="p-0">
                      <div className="aspect-[3/4] overflow-hidden">
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt}
                          width={600}
                          height={800}
                          className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
                          data-ai-hint={product.images[0].hint}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</CardTitle>
                      <p className="text-xl font-bold text-primary">{product.priceFormatted}</p>
                    </CardContent>
                  </Card>
                </div>
              </ProductDetailsDialog>
            ))}
          </div>
        </section>
      </main>
      <footer className="bg-card border-t mt-auto">
          <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Darpan Wears. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}
