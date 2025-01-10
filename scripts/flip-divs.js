const flipButton = document.getElementById("flip");
const cardContainer = document.createElement("div"); // Crear un contenedor para la tarjeta
const body = document.body;
const addCard=document.getElementById("add-flash");
const cards=[];
const carousel=document.getElementById("carousel");
const deleteCards=document.getElementById("delete-flash");

//Para agregar nuevas tarjetas
addCard.addEventListener("click", () => {

    // Crear contenedor para la tarjeta
    const newCardContainer = document.createElement("div");
    newCardContainer.classList.add("card-container");

    // Crear frente de la tarjeta
    const newFrontFlash = document.createElement("div");
    newFrontFlash.classList.add("flash-card-front"); // Igual que la clase original

    const questionInput = document.createElement("textarea");
    questionInput.type = "text";
    questionInput.classList.add("input-question");
    questionInput.placeholder = "Ingrese la pregunta";

    const flipButton = document.createElement("button");
    flipButton.textContent = "Voltear";
    flipButton.classList.add("flp-button");

    newFrontFlash.appendChild(questionInput);
    newFrontFlash.appendChild(flipButton);

    // Crear reverso de la tarjeta
    const newBackFlash = document.createElement("div");
    newBackFlash.classList.add("flash-card-back"); // Igual que la clase original

    const answerInput = document.createElement("textarea");
    answerInput.classList.add("input-answer");
    answerInput.placeholder = "Ingrese la respuesta de la pregunta";

    newBackFlash.appendChild(answerInput);

    //Boton para poder volverle a dar vuelta a las flash-cards
    const flipButtonBack = document.createElement("button");
    flipButtonBack.textContent = "Volver a la pregunta";
    flipButtonBack.classList.add("bk-button");
    newBackFlash.appendChild(flipButtonBack);

    // Añadir frente y reverso al contenedor de la tarjeta
    newCardContainer.appendChild(newFrontFlash);
    newCardContainer.appendChild(newBackFlash);

    // Agregar la tarjeta al array y al DOM
    cards.push(newCardContainer);
    carousel.appendChild(newCardContainer);

    // Añadir funcionalidad de volteo a la tarjeta
    flipButton.addEventListener("click", () => {
        newCardContainer.classList.toggle("flipped");
    });

    flipButtonBack.addEventListener("click",()=>{
        newCardContainer.classList.toggle("flipped");
    });
    //Seleccionar la nueva tarjeta
    currentCardIndex = cards.length - 1;
    updateCarousel();

    
});

function updateCarousel(){
    // Actualizar el contenido del carrousel
    cards.forEach((card,index)=>{
        card.classList.remove("selected","left","right");

        //Calcular el desplazamiento de la tarjeta
        const offset=index-currentCardIndex;

        //Mover las tarjetas conforme el desplazamiento calculado
        if (offset === 0) {
            // Tarjeta seleccionada
            card.classList.add("selected");
        } else if (offset > 0) {
            // Cartas a la derecha
            card.classList.add("right");
        } else {
            // Cartas a la izquierda
            card.classList.add("left");
        }

        if(offset!==0){
            card.classList.remove("flipped")
        }
    });
}
deleteCards.addEventListener("click",()=>{
    //Borrar todas las tarjetas del carrousel
    cards.forEach((card)=>{
        carousel.removeChild(card);
    });

    //Limpiar el array de las cartas para evitar errores
    cards.splice(0, cards.length);
});

//Manejo de evento para poder ir cambiando entre las flash-cards
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
        currentCardIndex = (currentCardIndex + 1) % cards.length; // Siguiente tarjeta
        updateCarousel();
    } else if (e.key === "ArrowLeft") {
        currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length; // Tarjeta anterior
        updateCarousel();
    }
});

