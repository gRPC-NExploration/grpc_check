using System.Security.Claims;

using App.Defaults;
using App.GrpcInterceptors;
using App.GrpcServices;
using App.Services.Contracts;
using App.Services.Implementations;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors();
builder.Services.AddGrpc(opt => 
{
    opt.Interceptors.Add<ExceptionInterceptor>();
    opt.Interceptors.Add<ServerLoggingInterceptor>();
});
builder.Services.AddHttpContextAccessor();
builder.Services.AddGrpcReflection();

// Other services
builder.Services.AddSingleton<IFileStore, FileStore>();
builder.Services.AddSingleton<IChatProvider, ChatProvider>();
builder.Services.AddSingleton<IBearerProvider, BearerProvider>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// Authorization
builder.Services
    .AddAuthorizationBuilder()
    .AddPolicy(JwtBearerDefaults.AuthenticationScheme, policy =>
    {
        policy.AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme);
        policy.RequireClaim(ClaimTypes.Name);
    });
builder.Services
    .AddAuthentication()
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateActor = false,
                ValidateLifetime = true,
                IssuerSigningKey = JwtShared.SecurityKey
            };
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseCors(builder =>
{
    builder
        .SetIsOriginAllowed(_ => true)
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
        .WithExposedHeaders("Grpc-Status", "Grpc-Message", "Grpc-Encoding", "Grpc-Accept-Encoding");
});

app.UseGrpcWeb(new GrpcWebOptions()
{
    DefaultEnabled = true
});

app.UseAuthentication();
app.UseAuthorization();

app.MapGrpcService<AuthenticationGrpcService>();
app.MapGrpcService<ChatGrpcService>();
app.MapGrpcService<StreamingBackFrontGrpcService>();
app.MapGrpcService<UnaryFrontBackGrpcService>();

if (app.Environment.IsDevelopment())
{
    app
        .MapGrpcReflectionService()
        .AllowAnonymous();
}

await app.RunAsync();