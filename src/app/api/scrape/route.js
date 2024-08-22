import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import axios from 'axios';
import cheerio from 'cheerio';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    // Prepare data for OpenAI processing
    const dataForProcessing = `
      Professor: ${professorName}
      Department: ${department}
      Overall Rating: ${overallRating}
      Reviews:
      ${reviews.join('\n')}
    `;

    // Use OpenAI to summarize and structure the data
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an assistant that summarizes professor information from Rate My Professor. Provide a concise summary and extract key points from the reviews."
        },
        {
          role: "user",
          content: dataForProcessing
        }
      ],
    });

    const summary = completion.choices[0].message.content;

    // Generate embedding for the summary
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: summary,
    });

    // Insert into Pinecone
    const index = pinecone.index('rag');
    await index.upsert([
      {
        id: professorName.replace(/\s+/g, '-').toLowerCase(),
        values: embedding.data[0].embedding,
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