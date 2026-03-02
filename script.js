// 1. Your Master List of spell components (filenames or URLs)

const spellComponents = [

    { src: "air.PNG", name: "Air" },
    { src: "area.PNG", name: "Area" },
    { src: "ball.PNG", name: "Ball" },
    { src: "beam.PNG", name: "Beam" },
    { src: "chain.PNG", name: "Chain" },
    { src: "earth.PNG", name: "Earth" },
    { src: "fire.PNG", name: "Fire" },
    { src: "ice.PNG", name: "Ice" },
    { src: "lightning.PNG", name: "Lightning" }
];
let currentQuestion = 1; // Start at 1 component
const maxQuestions = 3;  // You can increase this to X
const userResults = [];

const imageDisplay = document.getElementById('image-display');
const nextBtn = document.getElementById('next-btn');

const nameInput = document.getElementById('spell-name');
const descInput = document.getElementById('user-answer');
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwWTfdzGelK0yXT1cpaAdXmgmnkHqaa94P4E7nkTLBqRfju8Otb_1OPr8h7QWZtijyaVQ/exec";

// Function to send data to Google Sheets via Apps Script
async function saveToGoogleSheets(entry) {
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Essential for Google Apps Script
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });
        console.log("Data sent to sheet!");
    } catch (error) {
        console.error("Error saving data:", error);
    }
}

// Function to fetch past echoes based on the current runes
async function fetchPastEchoes(runeKey) {
    const sidebar = document.getElementById('sidebar-content');
    sidebar.innerHTML = "Searching the archives...";

    try {
        const response = await fetch(`${SCRIPT_URL}?runeKey=${runeKey}`);
        const pastSpells = await response.json();

        sidebar.innerHTML = ""; // Clear loading text

        if (pastSpells.length === 0) {
            sidebar.innerHTML = "<p class='empty'>No one has combined these runes yet. You are the first!</p>";
            return;
        }

        // Show the top 5 most recent results
        pastSpells.reverse().slice(0, 5).forEach(spell => {
            const card = document.createElement('div');
            card.className = "echo-card";
            card.innerHTML = `<strong>${spell.name}</strong><p>${spell.description}</p>`;
            sidebar.appendChild(card);
        });
    } catch (error) {
        sidebar.innerHTML = "The echoes are silent for now...";
    }
}
// 2. Function to pick random items (allowing repeats)

function getRandomComponents(count) {
    // pick 'count' components with replacement
    const results = [];
    for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * spellComponents.length);
        results.push(spellComponents[idx]);
    }
    return results;
}

// 3. Function to display the question
function loadQuestion() {
    // 1. Clear current UI
    imageDisplay.innerHTML = "";
    nameInput.value = "";
    descInput.value = "";
    
    // 2. Pick and display random runes
    const selected = getRandomComponents(currentQuestion);
    
    // 3. Generate the key (ABC sorting)
    const runeNames = selected.map(item => item.name).sort();
    const runeKey = runeNames.join("-");

    // 4. Update the Sidebar IMMEDIATELY
    fetchPastEchoes(runeKey);

    // 5. Render the rune images...
    renderImages(selected);
}
function renderImages(selectedComponents) {
    // 1. Clear the container so old runes don't stay on screen
    const imageDisplay = document.getElementById('image-display');
    imageDisplay.innerHTML = "";

    // 2. Loop through each selected rune object
    selectedComponents.forEach(item => {
        // Create a wrapper div for the "Card"
        const card = document.createElement('div');
        card.className = "component-card";

        // Create and configure the Image
        const img = document.createElement('img');
        img.src = `${item.src}`;
        img.alt = item.name;
        img.className = "rune-image";

        // Create the Label (The text under the image)
        const label = document.createElement('p');
        label.className = "component-label";
        label.innerText = item.name;

        // 3. Assemble the card and add it to the display
        card.appendChild(img);
        card.appendChild(label);
        imageDisplay.appendChild(card);
    });
}
// 4. Handle the "Next" click
nextBtn.addEventListener('click', async () => {
    // 1. Get the current runes' names and SORT them for consistency
    const currentRunes = Array.from(document.querySelectorAll('.component-label'))
                              .map(p => p.innerText)
                              .sort(); // This makes ABC the same as CBA
    
    const entry = {
        runeKey: currentRunes.join("-"), // e.g., "Air-Fire-Water"
        spellName: document.getElementById('spell-name').value,
        spellDescription: document.getElementById('user-answer').value
    };

    // 2. Send data to Google Sheets
    saveToGoogleSheets(entry);

    // 3. Logic to move to next question or finish
    if (currentQuestion < maxQuestions) {
        currentQuestion++;
        loadQuestion();
    } else {
        finishSurvey();
    }
});

function finishSurvey() {
    document.querySelector('.survey-container').innerHTML = 
        `<h2>Alchemy Complete!</h2><p>Your spells have been recorded.</p>`;
    console.log("Final Data:", userResults);
}

// Start!
loadQuestion();