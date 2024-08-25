import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { CohereClient } from 'cohere-ai'

const systemPrompt = `
You are a rate my professor agent to help students find classes, that takes in user questions and answers them.
For every user question, the top 3 professors that match the user question are returned.
Use them to answer the question if needed.`

export async function POST(req) {
    try {
        const data = await req.json()
        const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY})
        const index = await pc.index('rag').namespace('ns1')
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })

        // Initialize Cohere client
        const cohere = new CohereClient({ 
            token: process.env.COHERE_API_KEY 
        })

        const text = data[data.length - 1].content

        // Get embeddings using Cohere
        const embeddingResponse = await cohere.embed({
            texts: [text],
            model: 'embed-english-v2.0',
        })

        const embedding = embeddingResponse.embeddings[0]

        const results = await index.query({
            topK: 5,
            includeMetadata: true,
            vector: embedding,
        })

        let resultString = ''
        results.matches.forEach((match) => {
            resultString += `
            Returned Results:
            Professor: ${match.id}
            Review: ${match.metadata.stars}
            Subject: ${match.metadata.subject}
            Stars: ${match.metadata.stars}
            \n\n`
        })

        const lastMessage = data[data.length - 1]
        const lastMessageContent = lastMessage.content + resultString
        const lastDataWithoutLastMessage = data.slice(0, data.length - 1)

        const prompt = `${systemPrompt}\n\nUser Question: ${lastMessageContent}\n\nPrevious Messages: ${JSON.stringify(lastDataWithoutLastMessage)}`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const responseText = response.text()

        return new NextResponse(responseText)

    } catch (error) {
        console.error('Error:', error)
        return new NextResponse(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}