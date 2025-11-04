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
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { Product } from '@/lib/products';
import type { AIPromptSetting } from '@/lib/settings';

const DarpanAssistantInputSchema = z.object({
  question: z.string().describe("The user's question for the assistant."),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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

async function getAIPrompt(): Promise<string> {
    const defaultPrompt = `You are Darpan 2.0, a friendly and helpful AI shopping assistant for an e-commerce store called Darpan Wears.

Your goal is to answer user questions about products, ordering, shipping, or anything related to the store. Be concise and encouraging.

If the user provides an image, your primary task is to identify the product in the image by comparing it to the product catalog. State which product you think it is and why. If it's a screenshot from social media, acknowledge that and still try to find the matching product.

If no image is provided, answer the user's text-based question.

How to order:
1. Browse products and select one.
2. Check details, select a size, and click 'Order Now'.
3. Fill in your details and click 'Send Order on WhatsApp'.
All orders are placed via WhatsApp. Cash on Delivery is available for most products.`;
    
    try {
        const { firestore } = initializeFirebase();
        const promptDocRef = doc(firestore, 'settings', 'darpanAssistant');
        const promptDoc = await getDoc(promptDocRef);
        if (promptDoc.exists()) {
            const data = promptDoc.data() as AIPromptSetting;
            return data.basePrompt;
        }
        return defaultPrompt;
    } catch (error) {
        console.error("Error fetching AI prompt from Firestore. Using default.", error);
        return defaultPrompt;
    }
}

const promptTemplate = `{{{basePrompt}}}

Current Product Catalog:
---
{{#each products}}
- **{{name}}** (ID: {{id}}): {{description}} Price: ₹{{salePrice}}. Available sizes: {{#each sizes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/each}}
---

{{#if photoDataUri}}
User's Uploaded Image: {{media url=photoDataUri}}
{{/if}}

Now, please answer the following user question.

User Question: {{{question}}}`;


const darpanAssistantFlow = ai.defineFlow(
  {
    name: 'darpanAssistantFlow',
    inputSchema: DarpanAssistantInputSchema,
    outputSchema: DarpanAssistantOutputSchema,
  },
  async (input) => {
    // Fetch dynamic data for the prompt
    const products = await getProducts();
    const basePrompt = await getAIPrompt();

    const prompt = ai.definePrompt({
        name: 'darpanAssistantPrompt',
        input: {
            schema: z.object({
                question: z.string(),
                products: z.array(z.any()),
                photoDataUri: z.string().optional(),
                basePrompt: z.string(),
            })
        },
        output: { schema: DarpanAssistantOutputSchema },
        prompt: promptTemplate,
    });
    
    const { output } = await prompt({
        question: input.question,
        products: products,
        photoDataUri: input.photoDataUri,
        basePrompt: basePrompt,
    });

    return output || { answer: "I'm sorry, I couldn't process that request. Please try again." };
  }
);

    