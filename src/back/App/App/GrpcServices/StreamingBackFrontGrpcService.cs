using App.Protos;
using App.Services.Contracts;

using Google.Protobuf;
using Google.Protobuf.WellKnownTypes;
using Google.Rpc;

using Grpc.Core;

namespace App.GrpcServices;

public class StreamingBackFrontGrpcService(IFileStore filePathStore)
    : Protos.StreamingBackFrontService.StreamingBackFrontServiceBase
{
    private readonly IFileStore _filePathStore = filePathStore;

    public override async Task GetFileNames(GetFileNamesRequest request, IServerStreamWriter<GetFileNamesResponse> responseStream, ServerCallContext context)
    {
        foreach (var fileName in _filePathStore.FilesByName.Keys)
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
        if (!_filePathStore.FilesByName.TryGetValue(request.FileName, out var wrapper))
            throw GetFileNotFoundException(request.FileName, nameof(request.FileName));

        var response = new DownloadResponse()
        {
            Metadata = new FileMetadata { FileName = request.FileName }
        };

        await responseStream.WriteAsync(response, context.CancellationToken);

        var chunk = 1;

        await foreach (var chunkData in wrapper.File.ReadChunked(context.CancellationToken))
        {
            response.Chunk = chunk++;
            response.Data = UnsafeByteOperations.UnsafeWrap(chunkData);

            await responseStream.WriteAsync(response, context.CancellationToken);
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