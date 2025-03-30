document.addEventListener('DOMContentLoaded', async () => {
    
    //gets references to the UI controls
    const outputElement = document.getElementById('output');
    const commandLineElement = document.getElementById('prompt');
    const promptElement = document.getElementById('prompt-label');
    const bannerElement = document.getElementById('banner');
    
    //sets the current language according to the user's browser
    //TODO: implement localization
    let currentLanguage = getBrowserLanguage();
    
    //textual content of the prompt-label
    const promptText = "guest@staticvoid.it ~ #";
    
    //the welcome banner
    const bannerText =
        "███████╗████████╗ █████╗ ████████╗██╗ ██████╗██╗   ██╗ ██████╗ ██╗██████╗    ██╗████████╗\n" +
        "██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██║██╔════╝██║   ██║██╔═══██╗██║██╔══██╗   ██║╚══██╔══╝\n" +
        "███████╗   ██║   ███████║   ██║   ██║██║     ██║   ██║██║   ██║██║██║  ██║   ██║   ██║   \n" +
        "╚════██║   ██║   ██╔══██║   ██║   ██║██║     ╚██╗ ██╔╝██║   ██║██║██║  ██║   ██║   ██║   \n" +
        "███████║   ██║   ██║  ██║   ██║   ██║╚██████╗ ╚████╔╝ ╚██████╔╝██║██████╔╝██╗██║   ██║   \n" +
        "╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝  ╚═══╝   ╚═════╝ ╚═╝╚═════╝ ╚═╝╚═╝   ╚═╝     "  
    
    const welcomeText = "Hello, guest! Your terminal is ready. Type 'help' for a list of supported commands.<br/>"
    
    //keeps a history of the executed commands
    let historyIndex = -1;
    let history = [];
    
    //calls the UI initialization
    initUI();
    
    //initialize the UI 
    function initUI() {
        bannerElement.textContent = bannerText;
        promptElement.textContent = promptText;
        outputElement.innerHTML = welcomeText + '<br/>';
    }
    
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
        
        // if(isDebug) {
        //     appendToOutput("<div class='response'>");
        //     appendToOutput(`Command: ${command}<br>`);
        //     appendToOutput(`Args: ${args}<br>`);
        //     appendToOutput("</div>");
        // }
        
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
            case "":
                //empty command
                appendToOutput("");
                break;
            default:
                await executeHtmlOutputCommand("notfound");
        }
    }
    
    //queue a command to the commands history
    function addCommandToHistory(command) {
        if(command.trim().length > 0) {
            history.push(command);
            historyIndex = -1;
        }
    }

    //appends new content to the terminal's buffer
    function appendToOutput(html) {
        outputElement.innerHTML += html;
    }
    
    //clears the output
    function executeClearCommand() {
        initUI();
    }
    
    //change the UI language
    // function executeLangCommand(args) {
    //     //check if language is specified
    //     if(args.length === 0) {
    //         appendToOutput("<div class='response'>");
    //         appendToOutput("> Invalid or missing argument: language_id<br/>");
    //         appendToOutput("  Usage: lang --language_id><br/>");
    //         appendToOutput("    --en: sets current language to English<br/>");
    //         appendToOutput("    --it: sets current language to Italian");
    //     }
    // }
    
    //some commands simply display textual content upon invocation; the output for the command
    //is stored in a text file having the command as file name
    async function executeHtmlOutputCommand(command) {
        const output = await fetchExternalTextContent(command);
        appendToOutput("<div class='response'>" + output + "</div>");
    }
    
    //runs a command that opens a new browser window heading to the specified url
    function executeNavigateToCommand(url) {
        appendToOutput(`<div class='response'>> Navigating to ${url}...</div>`);
        window.open(url, "_blank");
    }
    
    //loads content from an external file
    async function fetchExternalTextContent(command) {
        const filePath = `assets/${command}.txt`;
        console.log(filePath);
        try {
            const response = await fetch(filePath);
            return (await response.text()).replace(/\n/g, '<br>');
        } catch (error) {
            return 'Error loading file: ' + error;
        }
    }

    //returns "it" if the current browser is in Italian, "en" otherwise
    function getBrowserLanguage() {
        return navigator.language;
    }
    
    function scrollToBottom() {
        commandLineElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    
});
