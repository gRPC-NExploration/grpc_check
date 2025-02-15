using System.CommandLine;
using System.CommandLine.Invocation;

using App.Protos;

using Google.Protobuf;

namespace FileManagerCliClient.Commands.File;

class UploadFileCommand : Command
{
    public IConsole Console { get; set; } = null!;

    public UploadFileCommand()
        : base(name: "upload", "Upload a file by name to the server")
    {
        AddArgument(new Argument<string>(name: "filepath", description: "The path to the existing file", parse: result => 
        {
            var filePath = result.Tokens.Single().Value;

            if (!System.IO.File.Exists(filePath))
            {
                result.ErrorMessage = "Provided file wasn't found";
                return string.Empty;
            }

            return filePath;
        }));
    }

    public new class Handler(UnaryFrontBackService.UnaryFrontBackServiceClient client)
    : ICommandHandler
    {
        private const int ChunkSize = 1024 * 32;

        private readonly UnaryFrontBackService.UnaryFrontBackServiceClient _client = client;

        public string FilePath { get; set; } = string.Empty;

        public int Invoke(InvocationContext context)
        {
            throw new NotImplementedException();
        }

        public async Task<int> InvokeAsync(InvocationContext context)
        {
            var fileName = System.IO.Path.GetFileName(FilePath);

            var buffer = new byte[ChunkSize];
            await using var fileStream = System.IO.File.OpenRead(FilePath);

            while (true)
            {
                var numBytesRead = await fileStream.ReadAsync(buffer);
                if(numBytesRead == 0)
                {
                    break;
                }

                var request = new App.Protos.File()
                {
                    FileName = fileName,
                    FileBytes = UnsafeByteOperations.UnsafeWrap(buffer)
                };

                await _client.UploadAsync(request, cancellationToken: context.GetCancellationToken());
            }

            var finalRequest = new App.Protos.File()
            {
                FileName = fileName,
                IsFinal = true
            };

            await _client.UploadAsync(finalRequest, cancellationToken: context.GetCancellationToken());

            System.Console.WriteLine("File successfully uploaded");

            return 0;
        }
    }
}
