using Microsoft.AspNetCore.Mvc;
using Npgsql;
using VisitasAPI.Services;
namespace VisitasAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EntradasController : ControllerBase
    {
        private readonly DbService _db;
        public EntradasController(DbService db) { _db = db; }
        [HttpGet]
        public async Task<IActionResult> GetEntradas()
        {
            using var con = _db.GetConnection();
            await con.OpenAsync();
            string query = @"SELECT es.id, es.visita_id,
                es.fecha_entrada,
                es.fecha_salida,
                es.estatus,
                v.nombre_visitante, v.persona_visitar, v.empresa
                FROM entradas_salidas es
                INNER JOIN visitas v ON es.visita_id = v.id
                ORDER BY es.id DESC";
            using var cmd = new NpgsqlCommand(query, con);
            using var reader = await cmd.ExecuteReaderAsync();
            var entradas = new List<object>();
            while (await reader.ReadAsync())
            {
                entradas.Add(new {
                    id = reader["id"],
                    visitaId = reader["visita_id"],
                    fechaEntrada = reader["fecha_entrada"] == DBNull.Value ? null : Convert.ToDateTime(reader["fecha_entrada"]).ToString("o"),
                    fechaSalida = reader["fecha_salida"] == DBNull.Value ? null : Convert.ToDateTime(reader["fecha_salida"]).ToString("o"),
                    estatus = reader["estatus"].ToString(),
                    nombreVisitante = reader["nombre_visitante"].ToString(),
                    personaVisitar = reader["persona_visitar"].ToString(),
                    empresa = reader["empresa"].ToString()
                });
            }
            return Ok(entradas);
        }
        [HttpPut("{id}/salida")]
        public async Task<IActionResult> DarSalida(int id)
        {
            using var con = _db.GetConnection();
            await con.OpenAsync();
            string query = "UPDATE entradas_salidas SET fecha_salida = NOW() AT TIME ZONE 'America/Mexico_City', estatus = 'Salio' WHERE id = @id";
            using var cmd = new NpgsqlCommand(query, con);
            cmd.Parameters.AddWithValue("@id", id);
            await cmd.ExecuteNonQueryAsync();
            return Ok(new { message = "Salida registrada." });
        }
    }
}
