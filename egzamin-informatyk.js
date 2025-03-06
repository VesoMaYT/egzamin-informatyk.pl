async function askMistral(prompt) {
    let apiKey = "CdlP3XSluKBTMVBPJslALgfg0PR22CNc";  // Wstaw klucz API z Mistral
    let response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "mistral-medium",  // Możesz też użyć "mistral-medium" lub "mistral-large"
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2000  // Zwiększamy limit tokenów, aby umożliwić więcej odpowiedzi
        })
    });

    let data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "Brak odpowiedzi";
}

async function solveQuestions() {
    let questions = [];

    document.querySelectorAll('.trescE').forEach((questionElement, index) => {
        let questionText = questionElement.innerText.trim();
        let questionNumber = index + 1;
        
        let answers = [];
        ['a', 'b', 'c', 'd'].forEach(letter => {
            let answerElement = document.getElementById(`odp${letter}${questionNumber}`);
            if (answerElement) {
                answers.push(answerElement.innerText.trim());
            }
        });

        questions.push({
            number: questionNumber,
            text: questionText,
            answers: answers
        });
    });

    console.log("Pytania pobrane:", questions);

    let midIndex = Math.ceil(questions.length / 2);
    let firstHalf = questions.slice(0, midIndex);
    let secondHalf = questions.slice(midIndex);

    let prompt1 = firstHalf.map(q => `${q.number}. ${q.text} Możliwe odpowiedzi: ${q.answers.join(", ")}`).join("\n");
    let prompt2 = secondHalf.map(q => `${q.number}. ${q.text} Możliwe odpowiedzi: ${q.answers.join(", ")}`).join("\n");

    // Pierwsza część: pierwsze 20 pytań
    let response1 = await askMistral(`Odpowiedz na pytania, wybierając jedną z możliwych odpowiedzi (podaj tylko literę odpowiedzi):\n${prompt1}`);
    // Druga część: kolejne pytania (jeśli jest ich więcej niż 20)
    let response2 = await askMistral(`Odpowiedz na pytania, wybierając jedną z możliwych odpowiedzi (podaj tylko literę odpowiedzi):\n${prompt2}`);

    console.log("Odpowiedzi z Mistral:", response1, response2);

    let allResponses = (response1 + "\n" + response2).split("\n");

    // Czyszczenie odpowiedzi: wyciągamy tylko litery A, B, C lub D
    let cleanedResponses = allResponses.map(response => {
        let match = response.match(/[A-D]/);  // Wyszukiwanie tylko liter A, B, C lub D
        return match ? match[0] : "Brak odpowiedzi";  // Zwracamy tylko literę lub komunikat "Brak odpowiedzi"
    });

    console.log("Oczyszczone odpowiedzi:", cleanedResponses);

    // Przypisanie odpowiedzi do pytań: upewniamy się, że każdemu pytaniu przypisana jest odpowiedź
    let solvedQuestions = questions.map((q, index) => ({
        ...q,
        solution: cleanedResponses[index] || "Brak odpowiedzi"  // Jeśli nie ma odpowiedzi, przypisujemy "Brak odpowiedzi"
    }));

    // Sprawdzamy, czy wszystkie pytania mają przypisaną odpowiedź
    solvedQuestions.forEach((q, index) => {
        if (!q.solution) {
            console.warn(`Brak odpowiedzi dla pytania ${q.number}`);
        }
    });

    // Klikanie odpowiedzi w formularzu
    solvedQuestions.forEach((q, index) => {
        let answerId = `ans${q.solution.toLowerCase()}${q.number}`;  // np. ans1a, ans1b
        let answerElement = document.getElementById(answerId);
        if (answerElement) {
            answerElement.click();  // Klikamy odpowiedź
        } else {
            console.warn(`Brak elementu dla odpowiedzi ${answerId}`);
        }
    });

    document.getElementById('sprawdz').click()
}

solveQuestions();
