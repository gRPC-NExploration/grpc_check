using Grpc.Core;
using Grpc.Core.Interceptors;

namespace App.GrpcInterceptors;

// <inheritdoc/>
public class ServerLoggingInterceptor(ILogger<ServerLoggingInterceptor> logger)
    : Interceptor
{
    private readonly ILogger<ServerLoggingInterceptor> _logger = logger;

    public override async Task<TResponse> UnaryServerHandler<TRequest, TResponse>(
        TRequest request,
        ServerCallContext context,
        UnaryServerMethod<TRequest, TResponse> continuation)
    {
        LogCall<TRequest, TResponse>(MethodType.Unary, context);
        return await continuation(request, context);
    }

    public override Task<TResponse> ClientStreamingServerHandler<TRequest, TResponse>(
    IAsyncStreamReader<TRequest> requestStream,
    ServerCallContext context,
    ClientStreamingServerMethod<TRequest, TResponse> continuation)
    {
        LogCall<TRequest, TResponse>(MethodType.ClientStreaming, context);
        return base.ClientStreamingServerHandler(requestStream, context, continuation);
    }

    public override Task ServerStreamingServerHandler<TRequest, TResponse>(
        TRequest request,
        IServerStreamWriter<TResponse> responseStream,
        ServerCallContext context,
        ServerStreamingServerMethod<TRequest, TResponse> continuation)
    {
        LogCall<TRequest, TResponse>(MethodType.ServerStreaming, context);
        return base.ServerStreamingServerHandler(request, responseStream, context, continuation);
    }

    public override Task DuplexStreamingServerHandler<TRequest, TResponse>(
        IAsyncStreamReader<TRequest> requestStream,
        IServerStreamWriter<TResponse> responseStream,
        ServerCallContext context,
        DuplexStreamingServerMethod<TRequest, TResponse> continuation)
    {
        LogCall<TRequest, TResponse>(MethodType.DuplexStreaming, context);
        return base.DuplexStreamingServerHandler(requestStream, responseStream, context, continuation);
    }

    private void LogCall<TRequest, TResponse>(MethodType methodType, ServerCallContext context)
        where TRequest : class
        where TResponse : class
    {
        _logger.LogInformation(
            "Start receiving call. Type/method: {MethodType} / {Method}. Request: {RequestType}. Response: {ResponseType}",
            methodType,
            context.Method,
            typeof(TRequest),
            typeof(TResponse)
        );
    }
}
