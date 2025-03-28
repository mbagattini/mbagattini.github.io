document.addEventListener('DOMContentLoaded', async () => {
    
    //gets references to the UI controls
    const outputElement = document.getElementById('output');
    const commandLineElement = document.getElementById('prompt');
    const promptElement = document.getElementById('prompt-label');
    const bannerElement = document.getElementById('banner');
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
        appendToOutput(`${promptText} ${userInput}`);
        const args = userInput.split(' ');
        const command = args[0].toLowerCase();
        switch (command) {
            case 'clear':
                clearOutput();
                break;
            case 'help':
            case 'qrcode':
            case 'who':
                await executeHtmlOutputCommand(command);
                break;
            case 'echo':
                if (args.length > 1) {
                    const message = args.slice(1).join(' ');
                    appendToOutput(message);
                } else {
                    appendToOutput('Missing argument for echo command.');
                }
                break;
            case '':
                //empty command, ignore
                appendToOutput("<br/>");
                break;
            default:
                appendToOutput(`> Command not found: ${command}`);
        }
    }
    
    //queue a command to the commands history
    function addCommandToHistory(command) {
        if(command.trim().length > 0) {
            history.push(command);
            historyIndex = -1;
        }
    }

    //appends new content to the history of the terminal
    function appendToOutput(html) {
        outputElement.innerHTML += html;
    }
    
    //clears the output
    function clearOutput() {
        initUI();
    }
    
    //some commands simply display textual content upon invocation; the output for the command
    //is stored in a text file having the command as file name
    async function executeHtmlOutputCommand(command) {
        const output = await fetchExternalTextContent(command);
        appendToOutput("<div class='response'>" + output + "</div>");
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
    
});
