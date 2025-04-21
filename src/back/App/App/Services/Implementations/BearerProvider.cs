using App.Defaults;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

using App.Services.Contracts;

using Microsoft.IdentityModel.Tokens;

namespace App.Services.Implementations;

public class BearerProvider : IBearerProvider
{
    public string Provide(string name)
    {
        var claims = new[] { new Claim(ClaimTypes.Name, name) };
        var credentials = new SigningCredentials(JwtShared.SecurityKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken("GrpcCheckServer", "GrpcCheckClient", claims, expires: DateTime.Now.AddSeconds(720), signingCredentials: credentials);
        return JwtShared.JwtTokenHandler.WriteToken(token);
    }
}
