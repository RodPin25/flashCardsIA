const flipButton = document.getElementById("flip"); // Obtener el botón para voltear tarjetas
const body = document.body; // Obtener el cuerpo del documento
const addCard = document.getElementById("add-flash"); // Obtener el botón para agregar tarjetas
const cards = []; // Array para almacenar las tarjetas
const carousel = document.getElementById("carousel"); // Obtener el contenedor del carrusel de tarjetas
const deleteCards = document.getElementById("delete-flash"); // Obtener el botón para eliminar tarjetas
const addDocButton = document.getElementById("upload-doc"); // Obtener el botón para subir documentos
const input = document.getElementById("fileInput"); // Obtener el input para seleccionar archivos
let currentCardIndex = 0; // Índice de la tarjeta actualmente seleccionada

// Para agregar nuevas tarjetas
addCard.addEventListener("click", () => {
    const newCardContainer = document.createElement("div"); // Crear un nuevo contenedor para la tarjeta
    newCardContainer.classList.add("card-container"); // Agregar clase para el estilo

    const newFrontFlash = document.createElement("div"); // Crear la parte frontal de la tarjeta
    newFrontFlash.classList.add("flash-card-front"); // Agregar clase para el estilo
    const questionInput = document.createElement("textarea"); // Crear un área de texto para la pregunta
    questionInput.classList.add("input-question"); // Agregar clase para el estilo
    questionInput.placeholder = "Ingrese la pregunta"; // Placeholder para el área de texto

    const flipButton = document.createElement("button"); // Crear un botón para voltear la tarjeta
    flipButton.textContent = "Voltear"; // Texto del botón
    flipButton.classList.add("flp-button"); // Agregar clase para el estilo

    newFrontFlash.appendChild(questionInput); // Agregar el área de texto a la parte frontal
    newFrontFlash.appendChild(flipButton); // Agregar el botón a la parte frontal

    const newBackFlash = document.createElement("div"); // Crear la parte trasera de la tarjeta
    newBackFlash.classList.add("flash-card-back"); // Agregar clase para el estilo
    const answerInput = document.createElement("textarea"); // Crear un área de texto para la respuesta
    answerInput.classList.add("input-answer"); // Agregar clase para el estilo
    answerInput.placeholder = "Ingrese la respuesta de la pregunta"; // Placeholder para el área de texto

    const flipButtonBack = document.createElement("button"); // Crear un botón para volver a la pregunta
    flipButtonBack.textContent = "Volver a la pregunta"; // Texto del botón
    flipButtonBack.classList.add("bk-button"); // Agregar clase para el estilo

    newBackFlash.appendChild(answerInput); // Agregar el área de texto a la parte trasera
    newBackFlash.appendChild(flipButtonBack); // Agregar el botón a la parte trasera

    newCardContainer.appendChild(newFrontFlash); // Agregar la parte frontal al contenedor de la tarjeta
    newCardContainer.appendChild(newBackFlash); // Agregar la parte trasera al contenedor de la tarjeta
    cards.push(newCardContainer); // Agregar la tarjeta al array de tarjetas

    const fragment = document.createDocumentFragment(); // Crear un fragmento de documento
    fragment.appendChild(newCardContainer); // Agregar la tarjeta al fragmento
    carousel.appendChild(fragment); // Agregar el fragmento al carrusel

    updateCarousel(); // Actualizar el carrusel para mostrar la nueva tarjeta
});

// Delegación de eventos para manejar el volteo de tarjetas
carousel.addEventListener("click", (e) => {
    if (e.target.classList.contains("flp-button")) {
        e.target.closest(".card-container").classList.toggle("flipped"); // Voltear la tarjeta
    } else if (e.target.classList.contains("bk-button")) {
        e.target.closest(".card-container").classList.toggle("flipped"); // Voltear la tarjeta de vuelta
    }
});

// Función para actualizar el carrusel
function updateCarousel() {
    cards.forEach((card, index) => {
        card.classList.remove("selected", "left", "right"); // Limpiar clases de selección

        const offset = index - currentCardIndex; // Calcular el desplazamiento
        if (offset === 0) {
            card.classList.add("selected"); // Marcar la tarjeta actual como seleccionada
        } else if (offset > 0) {
            card.classList.add("right"); // Marcar la tarjeta a la derecha
        } else {
            card.classList.add("left"); // Marcar la tarjeta a la izquierda
        }

        if (offset !== 0) {
            card.classList.remove("flipped"); // Asegurarse de que las tarjetas no estén volteadas
        }
    });
}

// Borrar todas las tarjetas
deleteCards.addEventListener("click", () => {
    cards.forEach((card) => {
        carousel.removeChild(card); // Eliminar cada tarjeta del carrusel
    });
    cards.length = 0; // Limpiar el array de tarjetas
    currentCardIndex = 0; // Reiniciar el índice de la tarjeta actual
});

// Navegación entre tarjetas con teclas
document.addEventListener("keydown", (e) => {
    if (cards.length === 0) return; // No hacer nada si no hay tarjetas

    if (e.key === "ArrowRight") {
        currentCardIndex = (currentCardIndex + 1) % cards.length; // Mover a la siguiente tarjeta
        updateCarousel(); // Actualizar el carrusel
    } else if (e.key === "ArrowLeft") {
        currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length; // Mover a la tarjeta anterior
        updateCarousel(); // Actualizar el carrusel
    }
});

// Subir un archivo y procesar tarjetas desde el servidor
addDocButton.addEventListener("click", async () => {
    input.click(); // Abrir el selector de archivos
});

input.addEventListener("change", async (event) => {
    const file = event.target.files[0]; // Obtener el archivo seleccionado

    if (!file || file.type !== 'application/pdf') {
        alert('Por favor, selecciona un archivo PDF válido.'); // Verificar que el archivo sea un PDF
        return;
    }

    const formData = new FormData(); // Crear un objeto FormData
    formData.append('file', file); // Agregar el archivo al FormData

    try {
        const uploadResponse = await fetch('/flashcard', {
            method: 'POST',
            body: formData // Enviar el archivo al servidor
        });

        if (!uploadResponse.ok) {
            throw new Error('Error al subir el archivo'); // Manejar errores de subida
        }

        const data = await uploadResponse.json(); // Obtener la respuesta del servidor
        console.log(`Respuesta de la API:`, data); // Mostrar la respuesta en la consola

        const rawText = data.response.candidates[0].content.parts[0].text; // Extraer el texto de la respuesta

        // Paso 2: Extrae el bloque JSON del texto (usa regex para aislar el array)
        const jsonMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (!jsonMatch) throw new Error("No se encontró un bloque JSON en el texto."); // Manejar errores de formato

        // Paso 3: Convierte el bloque JSON en un array
        const flashcards = JSON.parse(jsonMatch[0]); // Parsear el JSON

        if (Array.isArray(flashcards) && flashcards.every(card => card.front && card.back)) {
            flashcards.forEach((flashcard) => {
                const newCardContainer = document.createElement("div"); // Crear un nuevo contenedor para la tarjeta
                newCardContainer.classList.add("card-container"); // Agregar clase para el estilo

                const newFrontFlash = document.createElement("div"); // Crear la parte frontal de la tarjeta
                newFrontFlash.classList.add("flash-card-front"); // Agregar clase para el estilo
                newFrontFlash.textContent = flashcard.front; // Establecer el contenido de la parte frontal

                const newBackFlash = document.createElement("div"); // Crear la parte trasera de la tarjeta
                newBackFlash.classList.add("flash-card-back"); // Agregar clase para el estilo
                newBackFlash.textContent = flashcard.back; // Establecer el contenido de la parte trasera

                newCardContainer.appendChild(newFrontFlash); // Agregar la parte frontal al contenedor de la tarjeta
                newCardContainer.appendChild(newBackFlash); // Agregar la parte trasera al contenedor de la tarjeta
                cards.push(newCardContainer); // Agregar la tarjeta al array de tarjetas

                carousel.appendChild(newCardContainer); // Agregar la tarjeta al carrusel
            });

            updateCarousel(); // Actualizar el carrusel
        } else {
            console.error("Formato de datos incorrecto:", flashcards); // Manejar errores de formato
        }
    } catch (error) {
        console.error("Error al subir el archivo:", error); // Manejar errores de subida
        alert("Ocurrió un error al procesar el archivo. Inténtalo nuevamente."); // Mostrar mensaje de error
    }
});
