const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let waitingUser = null;

wss.on('connection', (ws) => {
    console.log('New user connected!');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'find') {
            if (waitingUser && waitingUser !== ws) {
                ws.partner = waitingUser;
                waitingUser.partner = ws;
                waitingUser.send(JSON.stringify({ type: 'system', text: 'Naya dost mil gaya! Baat shuru karo! 😎' }));
                ws.send(JSON.stringify({ type: 'system', text: 'Naya dost mil gaya! Baat shuru karo! 😎' }));
                waitingUser = null;
            } else {
                waitingUser = ws;
                ws.send(JSON.stringify({ type: 'system', text: 'Dost dhoondh raha hoon... Thoda wait kar! 🔍' }));
            }
        } else if (data.type === 'message') {
            if (ws.partner) {
                ws.partner.send(JSON.stringify({ type: 'message', text: data.text }));
            } else {
                ws.send(JSON.stringify({ type: 'system', text: 'Abhi koi dost nahi mila! Thoda wait kar ya "Find New" dabao! 😅' }));
            }
        }
    });

    ws.on('close', () => {
        console.log('User disconnected');
        if (ws.partner) {
            ws.partner.send(JSON.stringify({ type: 'system', text: 'Dost disconnect ho gaya! Naya dost dhoondho! 😔' }));
            ws.partner.partner = null;
        }
        if (waitingUser === ws) waitingUser = null;
    });

    ws.on('error', (error) => {
        console.log('Error:', error);
    });
});

console.log('WebSocket server running on ws://localhost:8080');
