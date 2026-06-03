namespace VisitasAPI.Models
{
    public class Visita
    {
        public int Id { get; set; }
        public string NombreVisitante { get; set; } = "";
        public string Empresa { get; set; } = "";
        public string PersonaVisitar { get; set; } = "";
        public string Motivo { get; set; } = "";
        public DateTime Fecha { get; set; }
        public TimeSpan HoraEntrada { get; set; }
        public string Identificacion { get; set; } = "";
        public string Estatus { get; set; } = "Pendiente";
        public string CodigoQR { get; set; } = "";
    }

    public class LoginRequest
    {
        public string Usuario { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class EntradaSalida
    {
        public int Id { get; set; }
        public int VisitaId { get; set; }
        public DateTime? FechaEntrada { get; set; }
        public DateTime? FechaSalida { get; set; }
        public string Estatus { get; set; } = "En planta";
        public string NombreVisitante { get; set; } = "";
        public string PersonaVisitar { get; set; } = "";
    }
}
