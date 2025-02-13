using System.Collections.Concurrent;
using System.Runtime.CompilerServices;
using System.Threading.Channels;

namespace Domain.Entities;

public class Chat
{
    private readonly ConcurrentDictionary<Guid, Message> _messages = [];
    private readonly ConcurrentDictionary<Channel<Message>, byte> _subscribers = [];

    public string ChatName { get; init; }

    public string Creator { get; init; }

    public DateTime CreatedDateTime { get; init; }

    public IReadOnlyDictionary<Guid, Message> Messages => _messages;

    private Chat(string chatName, string creator, DateTime created)
    {
        ChatName = chatName;
        Creator = creator;
        CreatedDateTime = created;
    }

    public async Task<Message> SendMessage(MessageContent messageContent, string sender, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(sender))
            throw new ArgumentException("Sender name was empty.", nameof(sender));

        var message = Message.Create(this, messageContent, sender);

        _messages[message.Id] = message;

        var writeTasks = _subscribers.Keys.Select(async subscriber =>
        {
            try
            {
                await subscriber.Writer.WriteAsync(message, cancellationToken);
            }
            catch
            {
                _subscribers.TryRemove(subscriber, out _);
            }
        });

        await Task.WhenAll(writeTasks);

        return message;
    }

    public async IAsyncEnumerable<Message> ReadNewMessages([EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var channel = Channel.CreateUnbounded<Message>();
        _subscribers.TryAdd(channel, 0);

        try
        {
            while (await channel.Reader.WaitToReadAsync(cancellationToken))
            {
                while (channel.Reader.TryRead(out var message))
                {
                    yield return message;
                }
            }
        }
        finally
        {
            _subscribers.TryRemove(channel, out _);
        }
    }

    public static Chat Create(string chatName, string creator)
    {
        if (string.IsNullOrWhiteSpace(chatName))
            throw new ArgumentException("Chat name was empty.", nameof(chatName));

        if (string.IsNullOrWhiteSpace(creator))
            throw new ArgumentException("Creator name was empty.", nameof(creator));

        return new Chat(chatName, creator, DateTime.UtcNow);
    }
}
