using Grpc.Core;

namespace App.Helpers;

public static class ExceptionHelpers
{
    public static RpcException Handle(this Exception exception, ServerCallContext context)
    {
        return exception switch
        {
            RpcException => (RpcException)exception,
            // В теории, будем тут располагать обработчики для наших исключений.
            _ => HandleDefault(exception)
        };
    }

    private static RpcException HandleDefault(Exception exception)
    {
        return new RpcException(new Status(StatusCode.Internal, exception.Message));
    }
}
