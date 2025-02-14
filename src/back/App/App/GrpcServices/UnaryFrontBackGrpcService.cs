using App.Models;
using App.Protos;
using App.Services.Contracts;

using Google.Protobuf.WellKnownTypes;
using Google.Rpc;

using Grpc.Core;

using Microsoft.AspNetCore.Authorization;

namespace App.GrpcServices;

public class UnaryFrontBackGrpcService(IFileStore filePathStore)
    : Protos.UnaryFrontBackService.UnaryFrontBackServiceBase
{
    private readonly IFileStore _filePathStore = filePathStore;

    public override async Task<Empty> Upload(Protos.File request, ServerCallContext context)
    {
        if (_filePathStore.FilesByName.TryGetValue(request.FileName, out var wrapper) && wrapper.File.Intact)
        {
            throw GetFileAlreadyExistsException(request.FileName, nameof(request.FileName));
        }
        else if (wrapper is null)
        {
            var metadata = Domain.ValueObjects.FileMetadata.Create(request.FileName);
            var file = Domain.Entities.File.Create(metadata);
            await file.SaveChunk(request.FileBytes.ToByteArray(), request.IsFinal, context.CancellationToken);
            var newFileWrapper = new FileWrapper() { File = file };
            _filePathStore.FilesByName.TryAdd(request.FileName, newFileWrapper);
        }
        else
        {
            var file = wrapper.File;
            await file.SaveChunk(request.FileBytes.ToByteArray(), request.IsFinal, context.CancellationToken);
        }

        return new Empty();
    }

    [Authorize]
    public override Task<ClearStoredFilesResponse> ClearStoredFiles(Empty request, ServerCallContext context)
    {
        var result = new ClearStoredFilesResponse()
        {
            CleanedCount = _filePathStore.FilesByName.Count
        };

        foreach (var file in _filePathStore.FilesByName.Values.Select(x => x.File))
        {
            file.Delete();
        }

        _filePathStore.FilesByName.Clear();

        return Task.FromResult(result);
    }

    public RpcException GetFileAlreadyExistsException(string fileName, string paramName)
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