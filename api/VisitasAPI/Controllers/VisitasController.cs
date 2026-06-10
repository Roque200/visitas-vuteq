using Microsoft.AspNetCore.Mvc;
using Npgsql;
using QRCoder;
using VisitasAPI.Models;
using VisitasAPI.Services;

namespace VisitasAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VisitasController : ControllerBase
    {
        private readonly DbService _db;

        public VisitasController(DbService db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetVisitas()
        {
            using var con = _db.GetConnection();
            await con.OpenAsync();
            string query = "SELECT id, nombre_visitante, empresa, persona_visitar, motivo, fecha, hora_entrada, estatus, codigo_qr FROM visitas ORDER BY id DESC";
            using var cmd = new NpgsqlCommand(query, con);
            using var reader = await cmd.ExecuteReaderAsync();
            var visitas = new List<object>();
            while (await reader.ReadAsync())
            {
                var fecha = reader["fecha"] is DateOnly d ? d.ToString("dd/MM/yyyy") : reader["fecha"].ToString();
                visitas.Add(new
                {
                    id = reader["id"],
                    nombreVisitante = reader["nombre_visitante"].ToString(),
                    empresa = reader["empresa"].ToString(),
                    personaVisitar = reader["persona_visitar"].ToString(),
                    motivo = reader["motivo"].ToString(),
                    fecha = fecha,
                    horaEntrada = reader["hora_entrada"].ToString(),
                    estatus = reader["estatus"].ToString(),
                    codigoQr = reader["codigo_qr"].ToString()
                });
            }
            return Ok(visitas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVisita(int id)
        {
            using var con = _db.GetConnection();
            await con.OpenAsync();
            string query = "SELECT id, nombre_visitante, empresa, persona_visitar, motivo, fecha, hora_entrada, estatus, codigo_qr FROM visitas WHERE id = @id";
            using var cmd = new NpgsqlCommand(query, con);
            cmd.Parameters.AddWithValue("@id", id);
            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var fecha = reader["fecha"] is DateOnly d ? d.ToString("dd/MM/yyyy") : reader["fecha"].ToString();
                return Ok(new
                {
                    id = reader["id"],
                    nombreVisitante = reader["nombre_visitante"].ToString(),
                    empresa = reader["empresa"].ToString(),
                    personaVisitar = reader["persona_visitar"].ToString(),
                    motivo = reader["motivo"].ToString(),
                    fecha = fecha,
                    horaEntrada = reader["hora_entrada"].ToString(),
                    estatus = reader["estatus"].ToString(),
                    codigoQr = reader["codigo_qr"].ToString()
                });
            }
            return NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> CreateVisita([FromBody] Visita visita)
        {
            visita.CodigoQR = Guid.NewGuid().ToString();
            using var con = _db.GetConnection();
            await con.OpenAsync();
            string query = "INSERT INTO visitas (nombre_visitante, empresa, persona_visitar, motivo, fecha, hora_entrada, identificacion, estatus, codigo_qr) VALUES (@nombre, @empresa, @persona, @motivo, @fecha, @entrada, @ident, 'Pendiente', @qr) RETURNING id";
            using var cmd = new NpgsqlCommand(query, con);
            cmd.Parameters.AddWithValue("@nombre", visita.NombreVisitante);
            cmd.Parameters.AddWithValue("@empresa", visita.Empresa);
            cmd.Parameters.AddWithValue("@persona", visita.PersonaVisitar);
            cmd.Parameters.AddWithValue("@motivo", visita.Motivo);
            cmd.Parameters.AddWithValue("@fecha", DateOnly.FromDateTime(visita.Fecha));
            cmd.Parameters.AddWithValue("@entrada", visita.HoraEntrada);
            cmd.Parameters.AddWithValue("@ident", visita.Identificacion);
            cmd.Parameters.AddWithValue("@qr", visita.CodigoQR);
            var newId = await cmd.ExecuteScalarAsync();
            return Ok(new { id = newId, codigoQr = visita.CodigoQR });
        }

        [HttpPut("{id}/confirmar")]
        public async Task<IActionResult> Confirmar(int id)
        {
            using var con = _db.GetConnection();
            await con.OpenAsync();
            string query = "UPDATE visitas SET estatus = 'Confirmada' WHERE id = @id RETURNING codigo_qr, nombre_visitante, fecha, hora_entrada";
            using var cmd = new NpgsqlCommand(query, con);
            cmd.Parameters.AddWithValue("@id", id);
            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                string codigoQr = reader["codigo_qr"].ToString()!;
                var fecha = reader["fecha"] is DateOnly d ? d.ToString("dd/MM/yyyy") : reader["fecha"].ToString();
                QRCodeGenerator qrGenerator = new QRCodeGenerator();
                QRCodeData qrData = qrGenerator.CreateQrCode(codigoQr, QRCodeGenerator.ECCLevel.Q);
                PngByteQRCode qrCode = new PngByteQRCode(qrData);
                byte[] qrBytes = qrCode.GetGraphic(5);
                string qrBase64 = Convert.ToBase64String(qrBytes);
                return Ok(new
                {
                    codigoQr = codigoQr,
                    qrImageBase64 = qrBase64,
                    nombreVisitante = reader["nombre_visitante"].ToString(),
                    fecha = fecha,
                    horaEntrada = reader["hora_entrada"].ToString()
                });
            }
            return NotFound();
        }

        [HttpPut("{id}/rechazar")]
        public async Task<IActionResult> Rechazar(int id)
        {
            using var con = _db.GetConnection();
            await con.OpenAsync();
            string query = "UPDATE visitas SET estatus = 'Rechazada' WHERE id = @id";
            using var cmd = new NpgsqlCommand(query, con);
            cmd.Parameters.AddWithValue("@id", id);
            await cmd.ExecuteNonQueryAsync();
            return Ok(new { message = "Visita rechazada." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVisita(int id)
        {
            using var con = _db.GetConnection();
            await con.OpenAsync();
            string deleteEntradas = "DELETE FROM entradas_salidas WHERE visita_id = @id";
            using var cmdEntradas = new NpgsqlCommand(deleteEntradas, con);
            cmdEntradas.Parameters.AddWithValue("@id", id);
            await cmdEntradas.ExecuteNonQueryAsync();
            string query = "DELETE FROM visitas WHERE id = @id";
            using var cmd = new NpgsqlCommand(query, con);
            cmd.Parameters.AddWithValue("@id", id);
            int affected = await cmd.ExecuteNonQueryAsync();
            if (affected == 0) return NotFound();
            return Ok(new { message = "Visita eliminada." });
        }

        [HttpPost("escanear")]
        public async Task<IActionResult> EscanearQR([FromBody] EscanearRequest body)
        {
            using var con = _db.GetConnection();
            await con.OpenAsync();
            string query = "SELECT id, nombre_visitante, fecha, estatus FROM visitas WHERE codigo_qr = @qr";
            using var cmd = new NpgsqlCommand(query, con);
            cmd.Parameters.AddWithValue("@qr", body.Codigo);
            using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return BadRequest(new { success = false, message = "Código QR no válido." });

            int visitaId = Convert.ToInt32(reader["id"]);
            string nombre = reader["nombre_visitante"].ToString()!;
            string estatus = reader["estatus"].ToString()!;
            var fechaVisita = reader["fecha"] is DateOnly d ? d : DateOnly.FromDateTime(Convert.ToDateTime(reader["fecha"]));
            await reader.CloseAsync();

            if (estatus != "Confirmada")
                return BadRequest(new { success = false, message = "La visita no está confirmada." });

            var hoy = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("America/Mexico_City")));
            if (fechaVisita != hoy)
                return BadRequest(new { success = false, message = $"Este QR es válido solo para el {fechaVisita:dd/MM/yyyy}. Hoy es {hoy:dd/MM/yyyy}." });

            string checkQuery = "SELECT COUNT(*) FROM entradas_salidas WHERE visita_id = @id";
            using var checkCmd = new NpgsqlCommand(checkQuery, con);
            checkCmd.Parameters.AddWithValue("@id", visitaId);
            long usos = (long)(await checkCmd.ExecuteScalarAsync())!;
            if (usos > 0)
                return BadRequest(new { success = false, message = "Este código QR ya fue utilizado." });

            string insertQuery = "INSERT INTO entradas_salidas (visita_id, fecha_entrada, estatus) VALUES (@id, NOW() AT TIME ZONE 'America/Mexico_City', 'En planta')";
            using var insertCmd = new NpgsqlCommand(insertQuery, con);
            insertCmd.Parameters.AddWithValue("@id", visitaId);
            await insertCmd.ExecuteNonQueryAsync();

            string updateQuery = "UPDATE visitas SET estatus = 'Usada' WHERE id = @id";
            using var updateCmd = new NpgsqlCommand(updateQuery, con);
            updateCmd.Parameters.AddWithValue("@id", visitaId);
            await updateCmd.ExecuteNonQueryAsync();

            return Ok(new { success = true, nombreVisitante = nombre });
        }
    }

    public class EscanearRequest
    {
        public string Codigo { get; set; } = "";
    }
}
