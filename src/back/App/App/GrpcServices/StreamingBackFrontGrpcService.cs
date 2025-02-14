using App.Protos;
using App.Services.Contracts;

using Google.Protobuf;
using Google.Protobuf.WellKnownTypes;
using Google.Rpc;

using Grpc.Core;

namespace App.GrpcServices;

public class StreamingBackFrontGrpcService(IFilePathStore filePathStore)
    : Protos.StreamingBackFrontService.StreamingBackFrontServiceBase
{
    private const int ChunkSize = 1024 * 32;

    private readonly IFilePathStore _filePathStore = filePathStore;

    public override async Task GetFileNames(GetFileNamesRequest request, IServerStreamWriter<GetFileNamesResponse> responseStream, ServerCallContext context)
    {
        foreach (var fileName in _filePathStore.PathByFileName.Keys)
        {
            await Task.Delay(request.Interval.ToTimeSpan());
            
            var result = new GetFileNamesResponse
            {
                FileName = fileName
            };

            await responseStream.WriteAsync(result);
        }
    }

    public override async Task Download(DownloadRequest request, IServerStreamWriter<DownloadResponse> responseStream, ServerCallContext context)
    {
        var fileName = request.FileName;

        if (!_filePathStore.PathByFileName.TryGetValue(fileName, out var path))
            throw GetFileNotFoundException(request.FileName, nameof(request.FileName));

        await responseStream.WriteAsync(new DownloadResponse
        {
            Metadata = new FileMetadata { FileName = fileName }
        });

        var buffer = new byte[ChunkSize];
        await using var fileStream = System.IO.File.OpenRead(path);
        var chunk = 1;

        while (true)
        {
            var numBytesRead = await fileStream.ReadAsync(buffer);
            if (numBytesRead == 0)
            {
                break;
            }

            await responseStream.WriteAsync(new DownloadResponse
            {
                Chunk = chunk++,
                Data = UnsafeByteOperations.UnsafeWrap(buffer.AsMemory(0, numBytesRead))
            });
        }
    }

    public RpcException GetFileNotFoundException(string fileName, string paramName)
    {
        return new Google.Rpc.Status()
        {
            Code = (int)Code.InvalidArgument,
            Message = $"The file \"{fileName}\" wasn't found.",
            Details =
            {
                Any.Pack(new BadRequest()
                {
                    FieldViolations =
                    {
                        new BadRequest.Types.FieldViolation
                        {
                            Field = paramName,
                            Description = "Файл не был предварительно загружен на сервер, либо был удален."
                        }
                    }
                })
            }
        }.ToRpcException();
    }
}