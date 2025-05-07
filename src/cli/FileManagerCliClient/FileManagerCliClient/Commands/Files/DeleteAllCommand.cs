using System.CommandLine;
using System.CommandLine.Invocation;

using App.Protos;

using Google.Protobuf.WellKnownTypes;

using Grpc.Core;

namespace FileManagerCliClient.Commands.Files;

class DeleteAllCommand : Command
{
    public IConsole Console { get; set; } = null!;

    public DeleteAllCommand()
        : base(name: "delete", "Removes all files from the server")
    {
        AddArgument(new Argument<string>(name: "username", description: "The username used to remove files"));
    }

    public new class Handler(
        UnaryFrontBackService.UnaryFrontBackServiceClient unaryClient,
        AuthenticationService.AuthenticationServiceClient authClient)
        : ICommandHandler
    {
        private readonly UnaryFrontBackService.UnaryFrontBackServiceClient _unaryClient = unaryClient;
        private readonly AuthenticationService.AuthenticationServiceClient authClient = authClient;

        public string UserName { get; set; } = string.Empty;

        public int Invoke(InvocationContext context)
        {
            throw new NotImplementedException();
        }

        public async Task<int> InvokeAsync(InvocationContext context)
        {
            var bearerRequest = new GetBearerTokenRequest()
            {
                UserName = UserName
            };

            var bearerResponse = await authClient.GetBearerTokenAsync(
                bearerRequest, 
                cancellationToken: context.GetCancellationToken());

            var metadata = new Metadata()
            {
                { "Authorization", $"Bearer {bearerResponse.BearerToken}" }
            };

            var response = await _unaryClient.ClearStoredFilesAsync(
                new Empty(), 
                headers: metadata, 
                cancellationToken: context.GetCancellationToken());

            System.Console.WriteLine($"Cleaned {response.CleanedCount} files. Cleaned file names: {response.CleanedFileNames}");

            return 0;
        }
    }
}
