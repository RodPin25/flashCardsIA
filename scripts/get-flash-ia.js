import express from 'express';
import fetch from 'node-fetch'; //Importa el node-fetch para que el servidor maneje http
import dotenv from 'dotenv'; // importa el archivo .env que se uso para resguardar la api
import { GoogleGenerativeAI } from '@google/generative-ai';


dotenv.config();

const app = express();
const PORT = 3000;

const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error('API key is required. Please set it in your .env file.');
}

const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
};

app.get('/create-flashcards', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) {
            return res.status(400).send('URL parameter is required'); //En caso de no haber ingresado ninguna url
        }

        console.log(`Fetching content from URL: ${url}`);

        const response = await fetch(url);
        const text = await response.text();

        console.log(`Fetched content length: ${text.length}`);

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: "I'm gonna give you an URL. Please analyze it and create flashcards with the most important info that you find in the document. Provide the information in two arrays: one for the questions and one for the answers. Return only the arrays, no other text."
        });

        const chatSession = model.startChat({ //Para empezar una interaccion con la ia
            generationConfig,
            history: [] //Mantiene el historial de la conversacion en caso de necesitar contexto
        });

        const result = await chatSession.sendMessage(text);//Envia el contenido obtenido de la url a la IA

        console.log(`AI response: ${result.response.text()}`);

        const flashcards = result.response.text();

        res.status(200).send({ flashcards });
    } catch (error) {
        console.error('Error creating flashcards:', error);
        res.status(500).send('An error occurred while creating flashcards');
    }
});

app.listen(PORT, () => {
    console.log(`Server corriendo en el puerto ${PORT}`);
});