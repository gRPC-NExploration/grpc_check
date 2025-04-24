using System.Collections.Concurrent;
using System.Threading.Tasks.Dataflow;

namespace Domain.Entities;

public class Chat
{
    private readonly ConcurrentDictionary<Guid, Message> _messages = [];
    private readonly BroadcastBlock<Message> _messageBlock = new(msg => msg);
    private readonly List<IDisposable> _subscriptions = [];

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

    public async Task<Message> SendMessage(Guid messageId, MessageContent messageContent, string sender, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(sender))
            throw new ArgumentException("Sender name was empty.", nameof(sender));

        var message = Message.Create(messageId, this, messageContent, sender);

        _messages[message.Id] = message;

        await _messageBlock.SendAsync(message, cancellationToken);

        return message;
    }

    public IAsyncEnumerable<Message> ReadNewMessages(CancellationToken cancellationToken)
    {
        var outputBlock = CreateSubscriber(cancellationToken);
        return outputBlock.ReceiveAllAsync(cancellationToken);
    }

    public static Chat Create(string chatName, string creator)
    {
        if (string.IsNullOrWhiteSpace(chatName))
            throw new ArgumentException("Chat name was empty.", nameof(chatName));

        if (string.IsNullOrWhiteSpace(creator))
            throw new ArgumentException("Creator name was empty.", nameof(creator));

        return new Chat(chatName, creator, DateTime.UtcNow);
    }

    private BufferBlock<Message> CreateSubscriber(CancellationToken cancellationToken)
    {
        var outputBlock = new BufferBlock<Message>(new()
        {
            CancellationToken = cancellationToken
        });

        var link = _messageBlock.LinkTo(outputBlock, new() { PropagateCompletion = true });

        _subscriptions.Add(link);

        cancellationToken.Register(() =>
        {
            link.Dispose();
            _subscriptions.Remove(link);
        });

        return outputBlock;
    }
}
