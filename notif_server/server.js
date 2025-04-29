const express = require("express");
const bodyParser = require('body-parser')
const http = require('http')
const WebSocket = require('ws')
const cors = require('cors')

const app = express()
const PORT = 3002
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })
const corsOption = {
    origin: ['http://127.0.0.1:5500']
}
app.use(cors(corsOption))
app.use(bodyParser.json())
const hostName = "127.0.0.1"

wss.on('connection', (ws) => {
    console.log(`connecting to ws`)

    ws.on('message', (message) => {
        console.log(`Received: `, message)
    })

    ws.on('close', () => console.log(`disconnected`))
})

app.post('/send-message',
    cors(corsOption),
    async (req, res) => {
        const { name, message } = req.body;

        if (!name || !message) {
            return res.status(400).json({ error: 'name and message are required' });
        }

        try {

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ name, message }));
                }
            });

            res.json({
                success: true,
                message: 'Notification sent successfully',
                name: name,
                contentMessage: message

            });
        } catch (error) {
            console.error('Error sending notification:', error);
            res.status(500).json({ error: 'Failed to send notification' });
        }


    })

server.listen(PORT, () => console.log(`Server running at http://${hostName}:${PORT}`))