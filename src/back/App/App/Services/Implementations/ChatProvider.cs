using System.Collections.Concurrent;

using App.Services.Contracts;

using Domain.Entities;

namespace App.Services.Implementations;

public class ChatProvider
    : IChatProvider
{
    public ConcurrentDictionary<string, Chat> ChatByName { get; } = [];

    public Chat Provide(string chatName, string currentUserName)
    {
        if (!ChatByName.TryGetValue(chatName, out var chat))
        {
            chat = Chat.Create(chatName, currentUserName);

            ChatByName[chatName] = chat;
        }

        return chat;
    }
}
