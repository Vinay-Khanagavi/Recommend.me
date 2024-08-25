import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CohereClient } from 'cohere-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const cohere = new CohereClient({ 
  token: process.env.COHERE_API_KEY 
});

export async function POST(req) {
  try {
    const { url } = await req.json();

    // Fetch the webpage
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extract relevant information
    const professorName = $('.NameTitle__Name-sc-14s4f8w-0').text().trim();
    const department = $('.NameTitle__Title-sc-14s4f8w-1').text().trim();
    const overallRating = $('.RatingValue__Numerator-qw8sqy-2').text().trim();
    const reviews = $('.Comments__StyledComments-dzzyvm-0').map((_, el) => $(el).text().trim()).get();

    // Prepare data for Gemini processing
    const dataForProcessing = `
      Professor: ${professorName}
      Department: ${department}
      Overall Rating: ${overallRating}
      Reviews:
      ${reviews.join('\n')}
    `;

    // Use Gemini to summarize and structure the data
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: `Summarize this professor information and extract key points from the reviews: ${dataForProcessing}` }]
      }]
    });
    const summary = result.response.text();

    // Generate embedding for the summary using Cohere
    const embeddingResponse = await cohere.embed({
      texts: [summary],
      model: 'embed-english-v2.0',
    });
    const embedding = embeddingResponse.embeddings[0];

    // Insert into Pinecone
    const index = pinecone.index('rag');
    await index.upsert([
      {
        id: professorName.replace(/\s+/g, '-').toLowerCase(),
        values: embedding,
        metadata: {
          professorName,
          department,
          overallRating,
          summary
        }
      }
    ]);

    return NextResponse.json({
      message: 'Professor data scraped and inserted successfully',
      professorName
    });
  } catch (error) {
    console.error('Error in scrape route:', error);
    return NextResponse.json({ error: 'Failed to scrape and insert professor data' }, { status: 500 });
  }
}