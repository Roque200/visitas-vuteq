using Microsoft.AspNetCore.Mvc;
using Npgsql;
using VisitasAPI.Models;
using VisitasAPI.Services;

namespace VisitasAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DbService _db;

        public AuthController(DbService db)
        {
            _db = db;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            using var con = _db.GetConnection();
            await con.OpenAsync();
            string query = "SELECT c_id_u, c_usuario, c_rol FROM tb_users WHERE c_usuario = @usr AND c_passwd = @pwd AND c_estatus = 1";
            using var cmd = new NpgsqlCommand(query, con);
            cmd.Parameters.AddWithValue("@usr", request.Usuario);
            cmd.Parameters.AddWithValue("@pwd", request.Password);
            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return Ok(new
                {
                    id = reader["c_id_u"],
                    usuario = reader["c_usuario"].ToString(),
                    rol = reader["c_rol"].ToString()
                });
            }
            return Unauthorized(new { message = "Usuario o contrasena incorrectos." });
        }
    }
}
