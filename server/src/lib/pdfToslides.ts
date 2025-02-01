import { exec } from "child_process";
import path from "path";

export async function PdfToSlides(filePath: string): Promise<boolean> {
  const outputDir = path.resolve(__dirname, "../../uploads/images");

  return new Promise((res, rej) => {
    exec(
      `magick "${filePath}" -quality 100 "${outputDir}/img-%03d.jpeg"`,
      (err) => {
        if (err) {
          console.error("Error:", err.message);
          rej(false);
        } else {
          console.log("Images generated successfully");
          res(true);
        }
      }
    );
  });
}
