export function formatDate(date: any) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Agrega un cero inicial si el número es menor que 10
  const day = String(date.getDate()).padStart(2, "0"); // Agrega un cero inicial si el número es menor que 10
  return `${year}${month}${day}`;
}
export function formatearFecha(fecha: string) {
  const año = fecha.substring(0, 4);
  const mes = fecha.substring(4, 6);
  const dia = fecha.substring(6, 8);
  return `${año}-${mes}-${dia}`;
}
