export function formatVndAmount(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numericValue)) {
    return "-";
  }

  return `${new Intl.NumberFormat("vi-VN").format(numericValue)} VNĐ`;
}
