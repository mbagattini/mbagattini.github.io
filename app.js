document.addEventListener('DOMContentLoaded', async () => {
    
    //gets references to the UI controls
    const outputElement = document.getElementById('output');
    const commandLineElement = document.getElementById('prompt');
    const promptElement = document.getElementById('prompt-label');
    const bannerElement = document.getElementById('banner');

    //sets the default language according to the user's browser
    let currentLanguage = getBrowserLanguage();
    
    //prompt text
    const promptText = "guest@staticvoid.it ~ #";
    
    //the welcome banner
    const bannerText =
        "███████╗████████╗ █████╗ ████████╗██╗ ██████╗██╗   ██╗ ██████╗ ██╗██████╗    ██╗████████╗\n" +
        "██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██║██╔════╝██║   ██║██╔═══██╗██║██╔══██╗   ██║╚══██╔══╝\n" +
        "███████╗   ██║   ███████║   ██║   ██║██║     ██║   ██║██║   ██║██║██║  ██║   ██║   ██║   \n" +
        "╚════██║   ██║   ██╔══██║   ██║   ██║██║     ╚██╗ ██╔╝██║   ██║██║██║  ██║   ██║   ██║   \n" +
        "███████║   ██║   ██║  ██║   ██║   ██║╚██████╗ ╚████╔╝ ╚██████╔╝██║██████╔╝██╗██║   ██║   \n" +
        "╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝  ╚═══╝   ╚═════╝ ╚═╝╚═════╝ ╚═╝╚═╝   ╚═╝     "  
    
    //localized welcome text
    const welcomeText = {
        en: "Hello, <i>guest</i>! Your terminal is ready. Type 'help' for a list of supported commands.<br/>",
        it: "Ciao, <i>ospite</i>! Il tuo terminale è pronto. Digita 'help' per un elenco dei comandi supportati.<br/>"
    };
    
    //keeps a history of the executed commands
    let historyIndex = -1;
    let history = [];

    // display "loading..." while assets are being loaded
    bannerElement.textContent = bannerText;
    promptElement.textContent = "Loading assets...";

    // preload assets
    const assets = await preloadAssets();
    
    //when ready, shows the prompt
    promptElement.textContent = promptText;
    outputElement.innerHTML = welcomeText[currentLanguage] + '<br/>';
    
    //listen for certain keypress to execute commands or scroll through history
    commandLineElement.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            const command = commandLineElement.value;
            addCommandToHistory(command);
            await executeCommand(command);
            commandLineElement.value = '';
            scrollToBottom();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (historyIndex < history.length - 1) {
                historyIndex++;
                commandLineElement.value = history[historyIndex];
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (historyIndex > -1) {
                historyIndex--;
                commandLineElement.value = history[historyIndex];
            }
        }
    });

    //executes a command received via text input
    async function executeCommand(userInput) {
        appendToOutput(`${promptText} ${userInput}<br/>`);
        const args = userInput.split(' ').slice(1);
        const command = userInput.split(' ')[0].toLowerCase();
        
        switch (command) {
            case "clear":
                executeClearCommand();
                break;
            case "help":
            case "hello":
            case "qrcode":
            case "contacts":
            case "cookies":
            case "privacy":
            case "ver":
            case "who":
                await executeHtmlOutputCommand(command);
                break;
            case "linkedin":
                executeNavigateToCommand("https://www.linkedin.com/in/matteobagattini/");
                break;
            case "cv":
                executeNavigateToCommand("assets/matteo-bagattini-cv.pdf");
                break;
            case "github":
                executeNavigateToCommand("https://github.com/mbagattini");
                break;
            case "lang":
                executeLangCommand(args);
            case "":
                //empty command
                appendToOutput("");
                break;
            default:
                await executeHtmlOutputCommand("notfound");
        }
    }

    //preloads all the external text files
    async function preloadAssets() {

        const languages = ["en", "it"]; // Supported languages
        const commands = ["help", "hello", "qrcode", "contacts", "cookies", "privacy", "ver", "who", "notfound"]; // List of commands
        const assets = {};
    
        for (const lang of languages) {
            assets[lang] = {}; // Initialize language object
            for (const command of commands) {
                const filePath = `assets/${lang}/${command}.txt`; // Assuming files are organized by language in subfolders
                try {
                    const response = await fetch(filePath);
                    if (response.ok) {
                        const text = await response.text();
                        assets[lang][command] = text.replace(/\n/g, '<br>'); // Store preloaded content
                    } else {
                        console.warn(`Failed to load ${filePath}: ${response.statusText}`);
                        assets[lang][command] = `Error: Could not load ${command} content.`;
                    }
                } catch (error) {
                    console.error(`Error fetching ${filePath}:`, error);
                    assets[lang][command] = `Error: Could not load ${command} content.`;
                }
            }
        }
    
        return assets;
    }
    
    //queue a command to the commands history
    function addCommandToHistory(command) {
        if(command.trim().length > 0) {
            history.push(command);
            historyIndex = -1;
        }
    }

    //appends new content to the terminal's buffer
    function appendToOutput(...htmlParts) {
        const htmlContent = htmlParts.join('');
        outputElement.innerHTML += htmlContent;
    }
    
    //clears the output
    function executeClearCommand() {
        promptElement.textContent = promptText;
        outputElement.innerHTML = welcomeText[currentLanguage] + '<br/>';
    }
    
    //change the UI language
    function executeLangCommand(args) {
        //check if language is specified
        if (args.length === 0 || (args[0] !== "en" && args[0] !== "it")) 
        {
            const errorMessage = {
                en: "&gt; Invalid or missing argument: <i>language_id</i><br/>" +
                    "   Usage: lang <i><language_id</i><br/>" +
                    "       <i>en</i>: sets current language to English<br/>" +
                    "       <i>it</i>: sets current language to Italian",
                it: "&gt; Argomento non valido o mancante: <i>language_id</i><br/>" +
                    "   Uso: lang <i>language_id</i><br/>" +
                    "       <i>en</i>: imposta la lingua corrente su inglese<br/>" +
                    "       <i>it</i>: imposta la lingua corrente su italiano"
            }

            appendToOutput(
                "<div class='response'>",
                errorMessage[currentLanguage],
                "</div>"
            );
        }
        else {
            currentLanguage = args[0];
            executeClearCommand();
        }
    }
    
    //some commands simply display textual content upon invocation; this method retrieves the content from the preloaded assets
    async function executeHtmlOutputCommand(command) {
        const output = assets[currentLanguage][command];
        appendToOutput(
            "<div class='response'>",
            output,
            "</div>"
        );
    }
    
    //runs a command that opens a new browser window heading to the specified url
    function executeNavigateToCommand(url) {
        appendToOutput(`<div class='response'>> Navigating to ${url}...</div>`);
        window.open(url, "_blank");
    }

    //returns "it" if the current browser is in Italian, "en" otherwise
    function getBrowserLanguage() {
        return navigator.language.startsWith('it') ? 'it' : 'en';
    }
    
    //scrolls the terminal to the bottom
    function scrollToBottom() {
        commandLineElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    
});
