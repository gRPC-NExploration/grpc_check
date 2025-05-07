using System.Collections.Concurrent;

using App.Services.Contracts;

using Domain.Entities;

namespace App.Services.Implementations;

public class ChatProvider
    : IChatProvider
{
    public ConcurrentDictionary<string, Chat> ChatByName { get; } 
        = new ConcurrentDictionary<string, Chat>(StringComparer.InvariantCultureIgnoreCase);

    public ChatProvider()
    {
        ChatByName["general"] = Chat.Create("General", "system");
    }

    public Chat Provide(string chatName, string currentUserName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(chatName);

        if (!ChatByName.TryGetValue(chatName, out var chat))
        {
            chat = Chat.Create(chatName, currentUserName);

            ChatByName[chatName] = chat;
        }

        return chat;
    }
}
