using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace App.Defaults;

public static class JwtShared
{
    internal static JwtSecurityTokenHandler JwtTokenHandler { get; } = new();
    internal static SymmetricSecurityKey SecurityKey { get; } = new(Guid.NewGuid().ToByteArray());
}
