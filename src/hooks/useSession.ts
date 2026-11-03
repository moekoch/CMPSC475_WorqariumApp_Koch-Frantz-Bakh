import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '../lib/socket';

// one fish in session positioned 0 to 1
export type Player = {
    id: string;
    username: string;
    avatarKey: string;
    x: number;
    y: number;
};

// join session and keep track of fish
export function useSession(sessionId: string) {
    // user fish
    const [self, setSelf] = useState<Player | null>(null);

    // others' fish
    const [players, setPlayers] = useState<Record<string, Player>>({});

    // error message
    const [error, setError] = useState('');

    // socket for screen
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = connectSocket();
        socketRef.current = socket;

        // ask to join
        socket.on('connect', () => {
            setError('');
            socket.emit('session:join', {sessionId});
        });

        // server sends user fish then others
        socket.on('session:self', (player: Player) => setSelf(player));
        socket.on('session:players', (list: Player[]) => {
            setPlayers(Object.fromEntries(list.map((p) => [p.id, p])));
        });

        // someone arrived
        socket.on('player:join', (player: Player) => {
            setPlayers((prev) => ({ ...prev, [player.id]: player }));
        });

        // someone moved
        socket.on('player:move', ({ id, x, y }: { id: string; x: number; y: number }) => {
            setPlayers((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], x, y } } : prev));
        })

        // someone left
        socket.on('player:leave', ({ id }: { id: string }) => {
            setPlayers((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        });

        // server refused
        socket.on('session:error', (data: { error: string }) => setError(data.error));
        socket.on('connect_error', (err: Error) => {
            setError(err.message === 'unauthorized' ? 'unauthorized' : 'Could not reach the server.');
        });

        // server ended connection
        socket.on('disconnect', (reason: string) => {
            if (reason === 'io server disconnect') {
                setError('You joined from another tab or device.');
            }
        });

        // leave screen
        return () => {
            socket.emit('session:leave');
            disconnectSocket();
            socketRef.current = null;
        };
    }, [sessionId]);

    // move user fish
    const move = useCallback((x: number, y: number) => {
        const nextX = Math.min(1, Math.max(0, x));
        const nextY = Math.min(1, Math.max(0, y));
 
        // show immediately
        setSelf((prev) => (prev ? { ...prev, x: nextX, y: nextY } : prev));
 
        // tell everyone else
        socketRef.current?.emit('move', { x: nextX, y: nextY });
    }, []);

    return { self, players, error, move };
}