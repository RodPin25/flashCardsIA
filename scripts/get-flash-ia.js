const express = require('express'); // Importar el framework Express
const multer = require('multer'); // Importar Multer para manejar la subida de archivos
const path = require('path'); // Importar el módulo path para manejar rutas de archivos
const fs = require('fs'); // Importar el módulo del sistema de archivos para operaciones de archivos
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Importar la biblioteca de Google Generative AI
const app = express(); // Crear una instancia de Express
const port = 3000; // Definir el puerto para el servidor

const apiKey = 'AIzaSyDMlUCD4y1d0SMa2I-DYpSaFdw62JoE3y0'; // Reemplaza con tu clave API
const genAI = new GoogleGenerativeAI(apiKey); // Inicializar la IA Generativa con la clave API
const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' }); // Obtener el modelo generativo

// Configuración de Multer para manejar la subida de archivos
const storage = multer.memoryStorage(); // Almacenar archivos en memoria
const upload = multer({
  storage,
  limits: { fileSize: 10000000 }, // Tamaño máximo del archivo: 1 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true); // Aceptar solo archivos PDF
    } else {
      cb(new Error('Solo se permiten archivos PDF')); // Rechazar archivos que no sean PDF
    }
  },
});

// Middleware para manejar errores de Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'Solo se permiten archivos PDF') {
    res.status(400).json({ error: err.message }); // Enviar respuesta de error para errores de Multer
  } else {
    next(err); // Pasar al siguiente middleware
  }
});

// Ruta principal
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos desde el directorio público
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pruebas.html')); // Servir el archivo HTML principal
});

// Procesar archivo subido y generar tarjetas
app.post('/flashcard', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' }); // Verificar si se subió un archivo
    }

    const base64Content = req.file.buffer.toString('base64'); // Convertir el buffer del archivo a base64
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: "I'm gonna give you docs. Please analyze them and give me flash cards...",
    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Content,
          mimeType: 'application/pdf',
        },
      },
      'Please give me flashcards from this document. If you dont have the answer , just say "I dont know". And that will be the content of the array. Please give the information of the flash cards in the lenguage of the document.',
    ]);

    res.json(result); // Enviar las tarjetas generadas como respuesta
  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    res.status(500).json({ error: 'Error al procesar el archivo' }); // Manejar errores de procesamiento
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`); // Registrar el inicio del servidor
});
