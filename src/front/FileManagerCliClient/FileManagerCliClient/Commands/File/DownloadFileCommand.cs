using System.CommandLine;
using System.CommandLine.Invocation;

using App.Protos;

using Grpc.Core;

namespace FileManagerCliClient.Commands.File;

public class DownloadFileCommand : Command
{
    public IConsole Console { get; set; } = null!;

    public DownloadFileCommand()
        : base(name: "download", "Download the file by name from the server")
    {
        var fileNameArg = new Argument<string>("filename", "The file name");
        AddArgument(fileNameArg);
        AddArgument(new Argument<string>(name: "savepath", description: "The path to save the file", parse: result => 
        {
            var filePath = result.Tokens.Single().Value;

            if (!System.IO.Path.HasExtension(filePath) && !System.IO.Path.Exists(filePath))
            {
                result.ErrorMessage = "Provided directory wasn't found";
                return string.Empty;
            }

            if (!System.IO.Path.HasExtension(filePath))
            {
                var fileName = result.GetValueForArgument<string>(fileNameArg);
                return Path.Combine(filePath, fileName);
            }

            return filePath;
        }));
    }

    public new class Handler(StreamingBackFrontService.StreamingBackFrontServiceClient client)
    : ICommandHandler
    {
        private readonly StreamingBackFrontService.StreamingBackFrontServiceClient _client = client;

        public string FileName { get; set; } = string.Empty;

        public string SavePath { get; set; } = string.Empty;

        public int Invoke(InvocationContext context)
        {
            throw new NotImplementedException();
        }

        public async Task<int> InvokeAsync(InvocationContext context)
        {
            var request = new App.Protos.DownloadRequest()
            {
                FileName = FileName
            };

            var call = _client.Download(request, cancellationToken: context.GetCancellationToken());

            using var fileStream = new System.IO.FileStream(SavePath, FileMode.Create, FileAccess.Write, FileShare.None);

            await foreach (var message in call.ResponseStream.ReadAllAsync(context.GetCancellationToken()))
            {
                await fileStream.WriteAsync(message.Data.ToByteArray(), context.GetCancellationToken());
            }

            System.Console.WriteLine("File successfully downloaded");

            return 0;
        }
    }
}
