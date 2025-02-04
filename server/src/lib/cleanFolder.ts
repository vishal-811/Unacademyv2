import path from "path";
import fs from "fs";

export async function ClearFolder(FileName: string, allSlidesUrl: string[]) {
  const pdfFolderPath = path.resolve(
    __dirname,
    `../../uploads/pdfs/${FileName}`
  );
  const imageFolderPath = path.resolve(__dirname, "../../uploads/images");

  await fs.promises.unlink(pdfFolderPath);
  allSlidesUrl.map(async (id) => {
    await fs.promises.unlink(`${imageFolderPath}/${id}.jpeg`);
  });
}
