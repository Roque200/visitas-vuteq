using Microsoft.AspNetCore.Mvc;
using Npgsql;
using VisitasAPI.Services;
namespace VisitasAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportesController : ControllerBase
    {
        private readonly DbService _db;
        public ReportesController(DbService db) { _db = db; }
        [HttpGet("visitas")]
        public async Task<IActionResult> GetReporte([FromQuery] string? desde, [FromQuery] string? hasta, [FromQuery] string? fecha, [FromQuery] string? mes, [FromQuery] string? anio)
        {
            using var con = _db.GetConnection();
            await con.OpenAsync();
            string whereClause = "WHERE 1=1";
            if (!string.IsNullOrEmpty(fecha))
                whereClause += $" AND v.fecha = '{fecha}'";
            else if (!string.IsNullOrEmpty(desde) && !string.IsNullOrEmpty(hasta))
                whereClause += $" AND v.fecha BETWEEN '{desde}' AND '{hasta}'";
            else if (!string.IsNullOrEmpty(mes) && !string.IsNullOrEmpty(anio))
                whereClause += $" AND EXTRACT(MONTH FROM v.fecha) = {mes} AND EXTRACT(YEAR FROM v.fecha) = {anio}";
            string query = $@"SELECT v.nombre_visitante, v.empresa, v.fecha, v.hora_entrada, es.fecha_salida, v.persona_visitar FROM visitas v LEFT JOIN entradas_salidas es ON es.visita_id = v.id {whereClause} ORDER BY v.fecha DESC, v.hora_entrada DESC";
            using var cmd = new NpgsqlCommand(query, con);
            using var reader = await cmd.ExecuteReaderAsync();
            var registros = new List<object>();
            while (await reader.ReadAsync())
            {
                var fechaVal = reader["fecha"] is DateOnly d ? d.ToString("dd/MM/yyyy") : reader["fecha"].ToString();
                registros.Add(new {
                    nombreVisitante = reader["nombre_visitante"].ToString(),
                    empresa = reader["empresa"].ToString(),
                    fechaEntrada = fechaVal + " " + reader["hora_entrada"].ToString(),
                    fechaSalida = reader["fecha_salida"] == DBNull.Value ? "—" : Convert.ToDateTime(reader["fecha_salida"]).ToString("dd/MM/yyyy HH:mm"),
                    solicitadoPor = reader["persona_visitar"].ToString()
                });
            }
            return Ok(registros);
        }
    }
}
