// ==UserScript==
// @name         Ollama Web Query
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Query current webpage with Ollama
// @match        *://*/*
// @grant        GM_xmlhttpRequest
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
                alert(response);
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
})();