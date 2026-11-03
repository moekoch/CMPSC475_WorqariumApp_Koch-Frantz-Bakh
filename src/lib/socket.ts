import { io, Socket } from 'socket.io-client';
import { API_URL, getToken } from './api';

// on shared connection for app
let socket: Socket | null = null;

// connect to server
export function connectSocket(): Socket {
    if (socket) return socket;

    socket = io(API_URL, {
        // send on every connect and reconnect
        auth: (cb) => {
            getToken().then((token) => cb({ token }));
        },

        // plain websocket
        transports: ['websocket'],
    });

    return socket;
}

// disconnect from server
export function disconnectSocket() {
    socket?.disconnect();
    socket = null;
}