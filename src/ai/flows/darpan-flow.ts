'use server';
/**
 * @fileOverview The AI assistant for Darpan Wears.
 *
 * - darpanAssistant - A function that handles user queries.
 * - DarpanAssistantInput - The input type for the darpanAssistant function.
 * - DarpanAssistantOutput - The return type for the darpanAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { Product } from '@/lib/products';

const DarpanAssistantInputSchema = z.object({
  question: z.string().describe('The user\'s question for the assistant.'),
});
export type DarpanAssistantInput = z.infer<typeof DarpanAssistantInputSchema>;

const DarpanAssistantOutputSchema = z.object({
  answer: z.string().describe('The AI assistant\'s answer to the user\'s question.'),
});
export type DarpanAssistantOutput = z.infer<typeof DarpanAssistantOutputSchema>;

// This function is exported and will be called by the frontend.
export async function darpanAssistant(input: DarpanAssistantInput): Promise<DarpanAssistantOutput> {
  return darpanAssistantFlow(input);
}

// Helper function to fetch products from Firestore.
// This is not a tool, but data fetched before calling the prompt.
async function getProducts(): Promise<Product[]> {
    try {
        const { firestore } = initializeFirebase();
        const productsCollection = collection(firestore, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map(doc => doc.data() as Product);
        return productsList;
    } catch (error) {
        console.error("Error fetching products for AI:", error);
        return [];
    }
}

const prompt = ai.definePrompt({
  name: 'darpanAssistantPrompt',
  input: {
      schema: z.object({
          question: z.string(),
          products: z.array(z.any()),
      })
  },
  output: { schema: DarpanAssistantOutputSchema },
  prompt: `You are Darpan 2.0, a friendly and helpful AI shopping assistant for an e-commerce store called Darpan Wears.

Your goal is to answer user questions about products, ordering, shipping, or anything related to the store. Be concise and encouraging.

You have access to the store's product list. Use it to answer questions about available items.

Current Product Catalog:
---
{{#each products}}
- **{{name}}** (ID: {{id}}): {{description}} Price: ₹{{salePrice}}. Available sizes: {{#each sizes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/each}}
---

How to order:
1. Browse products and select one.
2. Check details, select a size, and click 'Order Now'.
3. Fill in your details and click 'Send Order on WhatsApp'.
All orders are placed via WhatsApp. Cash on Delivery is available for most products.

Now, please answer the following user question.

User Question: {{{question}}}`,
});


const darpanAssistantFlow = ai.defineFlow(
  {
    name: 'darpanAssistantFlow',
    inputSchema: DarpanAssistantInputSchema,
    outputSchema: DarpanAssistantOutputSchema,
  },
  async (input) => {
    // Fetch the products to provide context to the prompt.
    const products = await getProducts();
    
    const { output } = await prompt({
        question: input.question,
        products: products,
    });

    return output || { answer: "I'm sorry, I couldn't process that request. Please try again." };
  }
);
