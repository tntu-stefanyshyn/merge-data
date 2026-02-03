const fs = require("fs");
const path = require("path");
const readline = require("readline");

const INPUT_DIR = "./csv_files";
const OUTPUT_FILE = "./merged_output.csv";
const SEPARATOR = ";";

async function mergeCSVs() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Помилка: Папка ${INPUT_DIR} не знайдена.`);
    return;
  }

  const files = fs
    .readdirSync(INPUT_DIR)
    .filter((file) => file.endsWith(".csv"));

  if (files.length === 0) {
    console.log("У папці немає CSV файлів.");
    return;
  }

  const writeStream = fs.createWriteStream(OUTPUT_FILE);
  let isFirstFile = true;

  for (const file of files) {
    const filePath = path.join(INPUT_DIR, file);
    const label = path.parse(file).name;

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let lineIndex = 0;

    for await (const line of rl) {
      if (!line.trim()) continue;

      const columns = line.split(SEPARATOR);

      columns.shift();

      const remainingContent = columns.join(SEPARATOR);

      if (lineIndex === 0) {
        if (isFirstFile) {
          writeStream.write(`class_label${SEPARATOR}${remainingContent}\n`);
          isFirstFile = false;
        }
      } else {
        writeStream.write(`${label}${SEPARATOR}${remainingContent}\n`);
      }
      lineIndex++;
    }
    console.log(`✅ Оброблено: ${file}`);
  }

  writeStream.end();
  console.log("\n---");
  console.log(`Готово! Усі дані збережено у: ${OUTPUT_FILE}`);
}

mergeCSVs().catch((err) => console.error("Сталася помилка:", err));
