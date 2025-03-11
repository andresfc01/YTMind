/**
 * Funciones relacionadas con fechas y horas
 */

/**
 * Obtiene la fecha y hora actual en el formato especificado
 * @param {Object} params - Parámetros para la función
 * @param {string} [params.format='medium'] - Formato de la fecha (short, medium, long)
 * @returns {Object} Objeto con la fecha en diferentes formatos
 */
export function getCurrentDate({ format = "medium" } = {}) {
  const now = new Date();

  // Obtener componentes de la fecha
  const day = now.getDate();
  const month = now.getMonth() + 1; // Los meses en JavaScript van de 0 a 11
  const year = now.getFullYear();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Nombres de días y meses en español
  const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const monthNames = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  // Formatear según el formato solicitado
  let formattedDate;
  let formattedTime;

  switch (format) {
    case "short":
      formattedDate = `${day}/${month}/${year}`;
      formattedTime = `${hours}:${minutes.toString().padStart(2, "0")}`;
      break;

    case "long":
      formattedDate = `${dayNames[now.getDay()]} ${day} de ${monthNames[now.getMonth()]} de ${year}`;
      formattedTime = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      break;

    case "medium":
    default:
      formattedDate = `${day} de ${monthNames[now.getMonth()]} de ${year}`;
      formattedTime = `${hours}:${minutes.toString().padStart(2, "0")}`;
      break;
  }

  // Retornar resultado
  return {
    iso: now.toISOString(),
    date: formattedDate,
    time: formattedTime,
    format,
    fullText: `${formattedDate} a las ${formattedTime}`,
    timestamp: now.getTime(),
  };
}
