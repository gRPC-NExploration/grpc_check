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

            try
            {
                await file.SaveChunk(request.FileBytes.ToByteArray(), request.IsFinal, context.CancellationToken);
            }
            catch (Exception ex) when (ex is OperationCanceledException or TaskCanceledException)
            {
                file.Delete();
                throw;
            }
            
            var newFileWrapper = new FileWrapper() { File = file };
            _filePathStore.AddFile(request.FileName, newFileWrapper);
        }
        else
        {
            var file = wrapper.File;

            try
            {
                await file.SaveChunk(request.FileBytes.ToByteArray(), request.IsFinal, context.CancellationToken);
            }
            catch (Exception ex) when (ex is OperationCanceledException or TaskCanceledException)
            {
                file.Delete();
                throw;
            }
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

        _filePathStore.ClearFiles();

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