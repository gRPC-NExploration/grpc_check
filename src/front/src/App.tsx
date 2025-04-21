import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
import { useState } from 'react';

import { AuthenticationServiceClient } from '../proto/authentication_service.client.ts';
import { ChatServiceClient } from '../proto/chat_service.client.ts';
import { Message, MessageResponse } from '../proto/chat_service.ts';
import { Timestamp } from '../proto/google/protobuf/timestamp.ts';

import './App.css';

const transport = new GrpcWebFetchTransport({
    baseUrl: 'http://localhost:8080',
    format: 'binary',
});

function App() {
    const [name, setName] = useState('');
    const [nameRoom, setNameRoom] = useState('');
    const [chatMessages, setChatMessages] = useState<MessageResponse[]>([]);
    const [messageText, setMessageText] = useState<Message>({
        messageText: '',
    });

    const authClient = new AuthenticationServiceClient(transport);
    const chatClient = new ChatServiceClient(transport);

    const getToken = () => {
        return document.cookie
            .split('; ')
            .find(item => item.includes('token'))
            ?.split('=')[1]
            .trim();
    };

    const login = async () => {
        if (name) {
            await authClient
                .getBearerToken({
                    userName: name.trim(),
                })
                .then(res => {
                    document.cookie = `token=${res.response.bearerToken.trim()}`;
                    alert('Вход выполнен успешно');
                })
                .catch(error => {
                    console.error(error);
                    alert('Произошла ошибка авторизации');
                });
        }
    };

    const createOrConnectRoom = async () => {
        const token = getToken();
        if (!token) {
            alert('Пожалуйста, войдите в аккаунт перед подключением к комнате');
            return;
        }

        if (!nameRoom.trim()) {
            alert('Пожалуйста, введите имя комнаты');
            return;
        }

        setChatMessages([]);

        const stream = chatClient.join(
            {
                chatName: nameRoom.trim(),
                messagesSince: Timestamp.fromDate(new Date(0)),
            },
            {
                meta: { Authorization: `Bearer ${token}` },
            },
        );

        for await (const res of stream.responses) {
            if (res.messages) {
                console.log(res.messages);
                setChatMessages(prevState => [...prevState, ...res.messages]);
            }
        }
    };

    const sendMessage = async () => {
        const token = getToken();
        if (!token) {
            alert('Пожалуйста, войдите в аккаунт перед подключением к комнате');
            return;
        }

        await chatClient.sendMessage(
            {
                chatName: name,
                messageText: messageText,
            },
            {
                meta: { Authorization: `Bearer ${token}` },
            },
        );
    };

    return (
        <div className="app-container">
            <div className="login-container">
                <div className="login-container_form">
                    <label htmlFor="username">Вход в аккаунт</label>
                    <input
                        id="username"
                        type="text"
                        value={name}
                        placeholder="Введите имя"
                        onChange={e => setName(e.target.value)}
                    />
                    <button onClick={login}>Войти</button>
                </div>
                <div className="login-container_form">
                    <label htmlFor="room">Войти или создать комнату</label>
                    <input
                        id="room"
                        type="text"
                        value={nameRoom}
                        placeholder="Введите имя комнаты"
                        onChange={e => setNameRoom(e.target.value)}
                    />
                    <button onClick={createOrConnectRoom}>
                        Войти или создать
                    </button>
                </div>
            </div>

            <div className="chat-wrapper">
                <div className="chat-title">
                    <h4>Чат</h4>
                </div>
                <div className="chat-content">
                    {chatMessages &&
                        chatMessages.map((msg, i) => (
                            <div className="chat-message" key={i}>
                                <div className="chat-message-content">
                                    <span>{msg.message?.messageText}</span>
                                    <div className="chat-message-sub">
                                        <span className="chat-message-time">
                                            {msg.messageSendTime &&
                                                Timestamp.toDate(
                                                    msg.messageSendTime,
                                                ).toTimeString()}
                                        </span>
                                        <span className="chat-message-name">
                                            {msg.senderName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
                <div className="chat-actions">
                    <input
                        type="text"
                        placeholder="Сообщение..."
                        value={messageText.messageText}
                        onChange={e =>
                            setMessageText({
                                messageText: e.target.value,
                            })
                        }
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!messageText.messageText}
                    >
                        Отправить
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
