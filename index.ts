import glob from "glob";
import argv from "minimist";
import fs from "fs-extra";

(async () => {
  const args = argv(process.argv.slice(2));
  const cwdList = args.cwd;
  const startTime = Date.now();

  const allFiles: { file: string; fullPath: string }[] = [];

  // Delete output folder
  await fs.remove("./output");

  if (cwdList) {
    for (const cwd of cwdList) {
      await new Promise((resolve) => {
        glob(
          "**/*(.env|*.env|.env*|local.settings.json)",
          {
            cwd,
            ignore: "**/{.git,node_modules}/**",
            dot: true,
          },
          (err, files) => {
            if (err) {
              console.log(err);
            }

            const cwdWithoutDrive = cwd.split("\\").pop();

            files = files.filter((file) => !file.includes(".env.example"));

            const results = files.map((file) => ({ file: `${cwdWithoutDrive}/${file}`, fullPath: `${cwd}/${file}` }));

            allFiles.push(...results);

            resolve({});
          }
        );
      });
    }
  } else {
    console.log("No cwd argument provided");
  }

  const endTime = Date.now();
  const time = (endTime - startTime) / 1000;

  console.log("allFiles", allFiles);

  for (const file of allFiles) {
    await fs.copy(file.fullPath, `./output/${file.file}`);
  }

  console.log(`Execution time: ${Math.round(time * 100) / 100}s`);
})();
