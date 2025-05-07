using System.CommandLine;
using System.CommandLine.Invocation;

using App.Protos;

using Grpc.Core;

namespace FileManagerCliClient.Commands.Files;

public class GetFileNamesCommand : Command
{
    public IConsole Console { get; set; } = null!;

    public GetFileNamesCommand() 
        : base(name: "list", "Get all files from the server")
    { }

    public new class Handler(StreamingBackFrontService.StreamingBackFrontServiceClient client) 
        : ICommandHandler
    {
        private readonly StreamingBackFrontService.StreamingBackFrontServiceClient _client = client;

        public int Invoke(InvocationContext context)
        {
            throw new NotImplementedException();
        }

        public async Task<int> InvokeAsync(InvocationContext context) 
        {
            var request = new GetFileNamesRequest()
            {
                Interval = new Google.Protobuf.WellKnownTypes.Duration() { Seconds = 1 }
            };

            using var call = _client.GetFileNames(request);

            var fileCounter = 1;

            await foreach (var message in call.ResponseStream.ReadAllAsync(context.GetCancellationToken()))
            {
                System.Console.WriteLine($"File name {fileCounter++}: {message.FileName}");
            }

            return 0;
        }
    }
}
