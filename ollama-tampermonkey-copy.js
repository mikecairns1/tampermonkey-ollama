// ==UserScript==
// @name         Ollama Web Query with Copy
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Query current webpage with Ollama and copy the response
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    // Create a button and add it to the page
    const button = document.createElement('button');
    button.textContent = 'Query with Ollama';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
    document.body.appendChild(button);

    button.addEventListener('click', async () => {
        const pageContent = document.body.innerText;
        const query = prompt('Enter your query:');
        if (query) {
            try {
                const response = await sendToOllama(pageContent, query);
                showResponseDialog(response);
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    });

    function sendToOllama(content, query) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'POST',
                url: 'http://localhost:11434/api/generate',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    model: 'llama3',
                    prompt: `Context: ${content}\n\nQuery: ${query}\n\nResponse:`,
                    stream: false
                }),
                onload: function(response) {
                    if (response.status === 200) {
                        const result = JSON.parse(response.responseText);
                        resolve(result.response);
                    } else {
                        reject(new Error('Failed to get response from Ollama'));
                    }
                },
                onerror: function(error) {
                    reject(error);
                }
            });
        });
    }

    function showResponseDialog(response) {
        // Create a modal dialog
        const dialog = document.createElement('div');
        dialog.style.position = 'fixed';
        dialog.style.left = '50%';
        dialog.style.top = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.backgroundColor = 'white';
        dialog.style.padding = '20px';
        dialog.style.border = '1px solid black';
        dialog.style.zIndex = '10000';
        dialog.style.maxWidth = '80%';
        dialog.style.maxHeight = '80%';
        dialog.style.overflow = 'auto';

        // Add response text
        const responseText = document.createElement('p');
        responseText.textContent = response;
        dialog.appendChild(responseText);

        // Add copy button
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy to Clipboard';
        copyButton.addEventListener('click', () => {
            GM_setClipboard(response);
            alert('Response copied to clipboard!');
        });
        dialog.appendChild(copyButton);

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginLeft = '10px';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        dialog.appendChild(closeButton);

        // Add the dialog to the page
        document.body.appendChild(dialog);
    }
})();