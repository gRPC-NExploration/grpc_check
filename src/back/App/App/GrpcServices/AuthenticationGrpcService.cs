using App.Protos;
using App.Services.Contracts;

using Grpc.Core;

namespace App.GrpcServices;

public class AuthenticationGrpcService(IBearerProvider bearerProvider)
    : Protos.AuthenticationService.AuthenticationServiceBase
{
    private readonly IBearerProvider _bearerProvider = bearerProvider;

    public override Task<GetBearerTokenResponse> GetBearerToken(GetBearerTokenRequest request, ServerCallContext context)
    {
        var result = new GetBearerTokenResponse()
        {
            BearerToken = _bearerProvider.Provide(request.UserName)
        };

        return Task.FromResult(result);
    }
}
