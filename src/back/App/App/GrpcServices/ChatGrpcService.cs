using App.Protos;
using App.Services.Contracts;

using Google.Protobuf.WellKnownTypes;

using Grpc.Core;

using Microsoft.AspNetCore.Authorization;

namespace App.GrpcServices;

[Authorize]
public class ChatGrpcService(IChatProvider chatProvider, ICurrentUserService currentUserService)
    : Protos.ChatService.ChatServiceBase
{
    private readonly IChatProvider _chatProvider = chatProvider;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public override async Task Join(Chat request, IServerStreamWriter<JoinChatResponse> responseStream, ServerCallContext context)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(request.ChatName);

        var chat = _chatProvider.Provide(request.ChatName, _currentUserService.GetCurrentUserName());

        var response = new JoinChatResponse()
        {
            ChatName = chat.ChatName,
            CreatorName = chat.Creator,
            CreatedTime = Timestamp.FromDateTime(chat.CreatedDateTime)
        };

        var requestedMessages = request.MessagesSince is null 
            ? chat.Messages.Values
            : chat.Messages.Values.Where(x => x.SendTime > request.MessagesSince.ToDateTime());
        requestedMessages = requestedMessages.SkipLast(1).OrderBy(x => x.SendTime);
        var messageStream = chat.ReadNewMessages(context.CancellationToken);

        foreach (var message in requestedMessages)
        {
            response.Messages.Add(ConvertMessageToMessageResponse(message));
        }

        await responseStream.WriteAsync(response, context.CancellationToken);

        await foreach (var message in messageStream)
        {
            response.Messages.Clear();
            response.Messages.Add(ConvertMessageToMessageResponse(message));
            await responseStream.WriteAsync(response, context.CancellationToken);
        }
    }

    public override async Task<Empty> SendMessage(SendMessageRequest request, ServerCallContext context)
    {
        var chat = _chatProvider.Provide(request.ChatName, _currentUserService.GetCurrentUserName());

        Domain.Entities.MessageContent messageContent = Domain.Entities.MessageContent.Create(request.MessageText.MessageText);

        await chat.SendMessage(messageContent, _currentUserService.GetCurrentUserName(), context.CancellationToken);

        return new();
    }

    private static MessageResponse ConvertMessageToMessageResponse(Domain.Entities.Message message)
    {
        return new()
        {
            ChatName = message.Chat.ChatName,
            Message = new()
            {
                MessageText = message.MessageContent.MessageText
            },
            SenderName = message.SenderName,
            MessageSendTime = Timestamp.FromDateTime(message.SendTime)
        };
    }
}
