// This file is loaded as a module. It defines the AI function and
// also attaches the necessary event listeners to the UI.

// This function calls our secure backend function.
async function generateProfessionalMessage(userInput) {
  try {
    // Get a reference to the callable function that you deployed.
    const getProfessionalMessage = firebase.functions().httpsCallable('getProfessionalMessage');
    
    // Call the function with the user's input text.
    const result = await getProfessionalMessage({ text: userInput });

    // The professional message from the cloud function is in result.data.
    return result.data;

  } catch (error) {
    console.error("Error calling getProfessionalMessage cloud function:", error);
    // Provide a user-friendly error message.
    if (error.code === 'unavailable') {
        return "The AI assistant is currently unavailable. Please check your network connection and try again.";
    }
    return "Sorry, an unexpected error occurred while contacting the AI assistant.";
  }
}

// This is the correct way to handle events for dynamically created elements.
// We add one listener to the document and check what was clicked.
document.addEventListener('click', async (event) => {
    // Check if the "Convert" button inside the AI modal was clicked
    if (event.target.matches('#generate-ai-message-btn')) {
        const button = event.target;
        const inputEl = document.getElementById('ai-input');
        const outputContainer = document.getElementById('ai-output-container');
        const outputEl = document.getElementById('ai-output');
        const spinner = document.getElementById('ai-spinner');

        const userInput = inputEl.value.trim();
        if (!userInput) {
            alert('Please enter a message.');
            return;
        }

        spinner.classList.remove('hidden');
        button.disabled = true;
        button.querySelector('span').textContent = 'Converting...';

        try {
            const result = await generateProfessionalMessage(userInput);
            outputEl.textContent = result;
            outputContainer.classList.remove('hidden');
        } catch (error) {
            console.error("Cloud Function error:", error);
            outputEl.textContent = error.message || 'Sorry, an error occurred. Please try again.';
            outputContainer.classList.remove('hidden');
        } finally {
            spinner.classList.add('hidden');
            button.disabled = false;
            button.querySelector('span').textContent = 'Convert to Professional English';
        }
    }
});
