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
