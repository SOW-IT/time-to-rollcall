export function sameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function inBetween(dateStart: Date, date: Date, dateEnd: Date) {
  return dateStart < date && date < dateEnd;
}

export function toddMonYYYY(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function toddMMYYYY(date: Date) {
  return date
    .toLocaleDateString("en-GB", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\//g, ".");
}

export function hoursAndMinutes(date: Date) {
  return date
    .toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\//g, ".");
}

export function convertToDateTimeLocalString(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export const currentYear = new Date().getFullYear();
export const currentYearStr = new Date().getFullYear().toString();
export const currentSOWYear =
  new Date().getMonth() >= 9 ? currentYear + 1 : currentYear;
export const currentSOWYearStr = currentSOWYear.toString();

export const allowedYears = () => {
  let years = [];
  for (let year = 2024; year <= currentYear; ++year) {
    years.push(year);
  }
  return years;
};
