## 📖 Visão Geral

Este projeto integra o Google Generative AI (GeminiService) com o Venom Bot (WhatsAppService) para criar um chatbot para o WhatsApp. O bot utiliza a inteligência artificial generativa do Google para processar e responder às mensagens.

## 🛠️ Configuração

1. **Variáveis de Ambiente**:
    - Certifique-se de ter um arquivo `.env` com sua `GEMINI_API_KEY`.
      ```
      GEMINI_API_KEY=sua_chave_de_api_do_google_generative_ai
      ```

2. **Dependências**:
    - Instale os pacotes necessários usando npm:
      ```sh
      npm install dotenv @google/generative-ai venom-bot
      ```

## 🤖 GeminiService

A classe `GeminiService` é responsável por se comunicar com a API do Google Generative AI para gerar respostas baseadas em texto.

### Código da Classe

```javascript
require('dotenv').config();

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold
} = require("@google/generative-ai");

class GeminiService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.modelConfig = {
            model: "gemini-1.5-pro-latest",
            systemInstruction: "",
        };
        this.generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 500000,
            responseMimeType: "text/plain",
        };
        this.safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];
    }

    async startChat() {
        this.chatSession = await this.genAI.getGenerativeModel(this.modelConfig).startChat({
            generationConfig: this.generationConfig,
            safetySettings: this.safetySettings,
            history: [],
        });
    }

    async sendMessage(message) {
        try {
            if (!this.chatSession) {
                await this.startChat();
            }
            const result = await this.chatSession.sendMessage(message);
            return result.response.text();
        } catch (error) {
            console.error("Problema ao enviar a mensagem:", error);
            throw error;
        }
    }
}

module.exports = GeminiService;
```

### 🔍 Explicação Detalhada

#### 1. Carregar Variáveis de Ambiente 🌿

```javascript
require('dotenv').config();
```

- Carrega as variáveis de ambiente do arquivo `.env`.

#### 2. Importar Módulos 📦

```javascript
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold
} = require("@google/generative-ai");
```

- Importa as classes e enumerações necessárias do pacote `@google/generative-ai`.

#### 3. Definir a Classe `GeminiService` 🛠️

```javascript
class GeminiService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.modelConfig = {
            model: "gemini-1.5-pro-latest",
            systemInstruction: "Evite usar linguagem formal ou rebuscada...",
        };
        this.generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 500000,
            responseMimeType: "text/plain",
        };
        this.safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];
    }

    async startChat() {
        this.chatSession = await this.genAI.getGenerativeModel(this.modelConfig).startChat({
            generationConfig: this.generationConfig,
            safetySettings: this.safetySettings,
            history: [],
        });
    }

    async sendMessage(message) {
        try {
            if (!this.chatSession) {
                await this.startChat();
            }
            const result = await this.chatSession.sendMessage(message);
            return result.response.text();
        } catch (error) {
            console.error("Problema ao enviar a mensagem:", error);
            throw error;
        }
    }
}
```

##### **`constructor()`** 🏗️

- **`apiKey`**: Obtém a chave da API do arquivo `.env`.
- **`this.genAI`**: Inicializa a instância do Google Generative AI com a chave da API.
- **`this.modelConfig`**: Configura o modelo de AI e as instruções do sistema para gerar respostas com o tom desejado.
- **`this.generationConfig`**: Configurações de geração, como temperatura, topP, topK e outros parâmetros de ajuste fino para a saída de texto.
- **`this.safetySettings`**: Configurações de segurança para definir como a IA deve lidar com conteúdos prejudiciais.

##### **`async startChat()`** 🚀

```javascript
async startChat() {
    this.chatSession = await this.genAI.getGenerativeModel(this.modelConfig).startChat({
        generationConfig: this.generationConfig,
        safetySettings: this.safetySettings,
        history: [],
    });
}
```

- Inicializa uma nova sessão de chat com a configuração especificada.

##### **`async sendMessage(message)`** ✉️

```javascript
async sendMessage(message) {
    try {
        if (!this.chatSession) {
            await this.startChat();
        }
        const result = await this.chatSession.sendMessage(message);
        return result.response.text();
    } catch (error) {
        console.error("Problema ao enviar a mensagem:", error);
        throw error;
    }
}
```

- Envia uma mensagem para a sessão de chat e retorna a resposta gerada.

## 📱 WhatsAppService

A classe `WhatsAppService` gerencia a interação com o Venom Bot para enviar e receber mensagens no WhatsApp.

### Código da Classe

```javascript
const venom = require('venom-bot');

class WhatsAppService {
    constructor(sessionName, messageHandler) {
        this.sessionName = sessionName;
        this.client = null;
        this.messageHandler = messageHandler;  // Handler para processar as mensagens recebidas
    }

    async initialize() {
        try {
            this.client = await venom.create({
                session: this.sessionName,
            });
            this.listenSingleContatcMenssage();
        } catch (error) {
            console.error('Erro a iniciar o cliente venom: ', error);
        }
    }

    listenToMessages() {
        this.client.onMessage(async (message) => {
            if (!message.isGroupMsg) {  // Ignorando mensagens de grupo, se necessário
                try {
                    const reply = await this.messageHandler(message.body);  // Usando o handler externo para obter a resposta
                    this.client.sendText(message.from, reply)
                        .then((result) => {
                            console.log('Mensagem enviada: ', result);
                        })
                        .catch((error) => {
                            console.error('Erro enviando a mensagem: ', error);
                        });
                } catch (error) {
                    console.error('Erro ao tratar a mensagem: ', error);
                    await this.client.sendText(message.from, 'Desculpe, ocorreu um erro ao processar sua mensagem.');
                }
            }
        });
    }
    listenSingleContatcMenssage() {
        this.client.onMessage(async (message) => {
            if (!message.isGroupMsg && message.from === '55xxxxxxxxxxx@c.us') { // Checando se o remetente é o contato desejado
                try {
                    const reply = await this.messageHandler(message.body);  // Usando o handler externo para obter a resposta
                    this.client.sendText(message.from, reply)
                        .then((result) => {
                            console.log('Mensagem enviada: ', result);
                        })
                        .catch((error) => {
                            console.error('Erro ao enviar a mensagem:', error);
                        });
                } catch (error) {
                    console.error('Erro ao tratar a mensagem: ', error);
                }
            }
        });
    }
}

module.exports = WhatsAppService;
```

### 🔍 Explicação Detalhada

#### Constructor 🏗️

```javascript
constructor(sessionName, messageHandler) {
    this.sessionName = sessionName;
    this.client = null;
    this.messageHandler = messageHandler;  // Handler para processar as mensagens recebidas
}
```

- **`sessionName`**: Nome da sessão do Venom Bot.
- **

`messageHandler`**: Função para processar as mensagens recebidas.

#### Inicializar o Cliente 🚀

```javascript
async initialize() {
    try {
        this.client = await venom.create({
            session: this.sessionName,
        });
        this.listenSingleContatcMenssage();
    } catch (error) {
        console.error('Erro a iniciar o cliente venom: ', error);
    }
}
```

- Inicializa o cliente do Venom Bot e começa a escutar mensagens de um contato específico.

#### Escutar Mensagens de Contatos Específicos 👂

```javascript
listenSingleContatcMenssage() {
    this.client.onMessage(async (message) => {
        if (!message.isGroupMsg && message.from === '55xxxxxxxxxxx@c.us') { // Checando se o remetente é o contato desejado
            try {
                const reply = await this.messageHandler(message.body);  // Usando o handler externo para obter a resposta
                this.client.sendText(message.from, reply)
                    .then((result) => {
                        console.log('Mensagem enviada: ', result);
                    })
                    .catch((error) => {
                        console.error('Erro ao enviar a mensagem:', error);
                    });
            } catch (error) {
                console.error('Erro ao tratar a mensagem: ', error);
            }
        }
    });
}
```

- Escuta mensagens de um contato específico e processa a resposta usando o `messageHandler`.

## 🌐 Integração

Integra `GeminiService` e `WhatsAppService` para processar e responder às mensagens recebidas.

### Código de Integração

```javascript
const WhatsAppService = require('./src/WhatsAppService');
const GeminiService = require('./src/GeminiService');

const geminiService = new GeminiService();

// Esta função será usada para processar mensagens usando o GeminiService
async function handleMessage(message) {
    try {
        return await geminiService.sendMessage(message); // Supondo que `sendMessage` retorna a resposta diretamente
    } catch (error) {
        console.error('Error in handleMessage:', error);
        return 'Erro ao processar sua mensagem.';
    }
}

// Passando a função `handleMessage` para o WhatsAppService
const whatsappService = new WhatsAppService('gemini-session', handleMessage);
whatsappService.initialize();
```

### 🔍 Explicação Detalhada

#### Inicialização dos Serviços 🚀

```javascript
const geminiService = new GeminiService();
```

- Inicializa o serviço `GeminiService`.

#### Função `handleMessage` 📨

```javascript
async function handleMessage(message) {
    try {
        return await geminiService.sendMessage(message); // Supondo que `sendMessage` retorna a resposta diretamente
    } catch (error) {
        console.error('Error in handleMessage:', error);
        return 'Erro ao processar sua mensagem.';
    }
}
```

- Define uma função para processar mensagens recebidas usando o `GeminiService`.

#### Inicialização do `WhatsAppService` 📱

```javascript
const whatsappService = new WhatsAppService('gemini-session', handleMessage);
whatsappService.initialize();
```

- Inicializa o `WhatsAppService` e começa a escutar mensagens, processando-as com a função `handleMessage`.

### 🏃‍♂️ Executando o Projeto

1. **Inicie o WhatsAppService**:
    - Inicie o serviço do Venom Bot com a função `handleMessage` para processar as mensagens recebidas.
      ```sh
      node index.js
      ```

2. **Interaja com o bot**:
    - Envie mensagens para o bot no WhatsApp e ele responderá utilizando o Google Generative AI conforme configurado.
