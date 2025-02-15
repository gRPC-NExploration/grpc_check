using System.CommandLine;
using System.CommandLine.Builder;
using System.CommandLine.Hosting;
using System.CommandLine.Invocation;
using System.CommandLine.Parsing;

using App.Protos;

using FileManagerCliClient.Commands.File;
using FileManagerCliClient.Commands.Files;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var rootCommand = new RootCommand()
{
    new Command("file", "Actions on local or remote file")
    {
        new DownloadFileCommand(),
        new UploadFileCommand()
    },
    new Command("files", "Actions on local or remote files")
    {
        new DeleteAllCommand(),
        new GetFileNamesCommand()
    },
};

var runner = new CommandLineBuilder(rootCommand)
    .UseHost(_ => Host.CreateDefaultBuilder(args), ConfigureHostBuilder)
    .UseExceptionHandler(ExceptionHandler)
    .UseDefaults()
    .Build();

return await runner.InvokeAsync(args);

static void ConfigureHostBuilder(IHostBuilder builder)
{
    builder.UseEnvironment("CLI");

    builder.ConfigureAppConfiguration(config =>
    {
        config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
        config.AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true);
        config.AddEnvironmentVariables();
    });

    builder.ConfigureServices((context, services) => 
    {
        var grpcUri = context.Configuration.GetSection("Servers").GetValue<Uri>("GrpcServerUri");

        services.AddGrpcClient<UnaryFrontBackService.UnaryFrontBackServiceClient>(ConfigureClient);
        services.AddGrpcClient<StreamingBackFrontService.StreamingBackFrontServiceClient>(ConfigureClient);
        services.AddGrpcClient<AuthenticationService.AuthenticationServiceClient>(ConfigureClient);

        void ConfigureClient(Grpc.Net.ClientFactory.GrpcClientFactoryOptions opt) => opt.Address = grpcUri;
    });

    builder.UseCommandHandler<DownloadFileCommand, DownloadFileCommand.Handler>();
    builder.UseCommandHandler<UploadFileCommand, UploadFileCommand.Handler>();
    builder.UseCommandHandler<DeleteAllCommand, DeleteAllCommand.Handler>();
    builder.UseCommandHandler<GetFileNamesCommand, GetFileNamesCommand.Handler>();
}

static void ExceptionHandler(Exception e, InvocationContext context)
{
    if (e is System.Reflection.TargetInvocationException)
    {
        e = e.InnerException!;
    }

    Console.ForegroundColor = ConsoleColor.Red;
#if DEBUG
    Console.Error.WriteLine(e);
#else
    Console.Error.WriteLine(e.Message);
#endif
    Console.ResetColor();

    context.ExitCode = e.HResult;
}