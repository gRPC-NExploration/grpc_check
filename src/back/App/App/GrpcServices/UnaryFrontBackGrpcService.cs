using App.Protos;
using App.Services.Contracts;

using Google.Protobuf.WellKnownTypes;
using Google.Rpc;

using Grpc.Core;

using Microsoft.AspNetCore.Authorization;

namespace App.GrpcServices;

public class UnaryFrontBackGrpcService(IFilePathStore filePathStore)
    : Protos.UnaryFrontBackService.UnaryFrontBackServiceBase
{
    private readonly IFilePathStore _filePathStore = filePathStore;

    public override async Task<Empty> Upload(Protos.File request, ServerCallContext context)
    {
        if (_filePathStore.PathByFileName.TryGetValue(request.FileName, out _))
            throw GetFileAlreadyExistsException(request.FileName, nameof(request.FileName));

        var path = Path.Combine(Path.GetTempPath(), request.FileName);

        await System.IO.File.WriteAllBytesAsync(request.FileName, request.FileBytes.ToByteArray());

        _filePathStore.PathByFileName.TryAdd(request.FileName, path);

        return new Empty();
    }

    [Authorize]
    public override Task<ClearStoredFilesResponse> ClearStoredFiles(Empty request, ServerCallContext context)
    {
        var result = new ClearStoredFilesResponse()
        {
            CleanedCount = _filePathStore.PathByFileName.Count
        };

        _filePathStore.PathByFileName.Clear();

        return Task.FromResult(result);
    }

    public RpcException GetFileAlreadyExistsException(string fileName, string paramName = "")
    {
        return new Google.Rpc.Status()
        {
            Code = (int)Code.InvalidArgument,
            Message = $"The file \"{fileName}\" already presented on the server.",
            Details =
            {
                Any.Pack(new BadRequest()
                {
                    FieldViolations =
                    {
                        new BadRequest.Types.FieldViolation
                        {
                            Field = paramName,
                            Description = "Файл уже был загружен. На сервере не может быть дублирования файлов по именам."
                        }
                    }
                })
            }
        }.ToRpcException();
    }
}