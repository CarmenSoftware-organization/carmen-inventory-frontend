export function formatName(firstname?: string, lastname?: string): string {
  const cleanName = (name?: string) => {
    const leadingThaiVowels = /^[เแโใไ]/;
    return name?.trim().replace(leadingThaiVowels, "") || "";
  };

  const first = cleanName(firstname)[0] || "";
  const last = cleanName(lastname)[0] || "";

  return (first + last).toUpperCase() || "U";
}
