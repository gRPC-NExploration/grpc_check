namespace Domain.Entities;

public class MessageContent
{
    public string MessageText { get; init; }

    private MessageContent(string messageText)
    {
        MessageText = messageText;
    }

    public static MessageContent Create(string messageText)
    {
        if (string.IsNullOrWhiteSpace(messageText))
            throw new ArgumentException("Message text was empty.", nameof(messageText));

        return new MessageContent(messageText);
    }
}
