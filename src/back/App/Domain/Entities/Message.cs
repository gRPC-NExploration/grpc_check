namespace Domain.Entities;

public class Message
{
    public Chat Chat { get; }

    public Guid Id { get; }
    
    public MessageContent MessageContent { get; }

    public string SenderName { get; }

    public DateTime SendTime { get; }

    private Message(Guid id, Chat chat, MessageContent messageContent, string sender, DateTime sendTime)
    {
        Id = id;
        Chat = chat;
        MessageContent = messageContent;
        SenderName = sender;
        SendTime = sendTime;
    }

    internal static Message Create(Chat chat, MessageContent messageContent, string sender)
    {
        return Create(Guid.NewGuid(), chat, messageContent, sender);
    }

    internal static Message Create(Guid id, Chat chat, MessageContent messageContent, string sender)
    {
        if (string.IsNullOrWhiteSpace(sender))
            throw new ArgumentException("Sender name was empty.", nameof(sender));

        return new Message(id, chat, messageContent, sender, DateTime.UtcNow);
    }
}
