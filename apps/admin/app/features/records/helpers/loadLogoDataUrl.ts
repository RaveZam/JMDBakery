// Fetches the bakery logo from the public folder and reads it back as a data
// URL, since jsPDF's addImage needs a data URL or raw bytes, not a file path.
export async function loadLogoDataUrl(): Promise<string> {
  const response = await fetch("/images/Logo.png");
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
