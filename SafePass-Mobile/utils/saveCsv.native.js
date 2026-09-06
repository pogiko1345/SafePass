import { File, Paths } from "expo-file-system";
import { isAvailableAsync, shareAsync } from "expo-sharing";

export default async function saveCsv(content, filename) {
  if (!(await isAvailableAsync())) throw new Error("File sharing is unavailable on this device.");
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  file.write(content);
  await shareAsync(file.uri, {
    mimeType: "text/csv",
    UTI: "public.comma-separated-values-text",
    dialogTitle: "Save attendance CSV",
  });
}
