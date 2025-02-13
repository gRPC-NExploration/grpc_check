using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace App.Defaults;

public static class JwtShared
{
    internal static JwtSecurityTokenHandler JwtTokenHandler { get; } = new();
    internal static SymmetricSecurityKey SecurityKey { get; } = new(Encoding.UTF8.GetBytes("Top secret signature of gRPC check app."));
}
