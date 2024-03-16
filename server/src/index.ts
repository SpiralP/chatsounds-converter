import express from "express";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import pump from "pump";
import tmp from "tmp";

ffmpeg.setFfmpegPath("ffmpeg");

const app = express();

app.use(express.static(path.join(__dirname, "..", "..", "client", "dist")));

app.post("/convert", async (req, res) => {
  const input = tmp.fileSync();
  console.log("/convert", input.name);

  try {
    await new Promise((resolve, reject) => {
      pump(req, fs.createWriteStream(input.name), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });

    const output = tmp.fileSync();
    console.log("converting", input.name, output.name);

    await new Promise((resolve, reject) => {
      ffmpeg(input.name)
        .inputOption(["-hide_banner", "-protocol_whitelist", "file"])
        // format      : ogg
        // ogg quality : ~30% / ~3
        // sample rate : 44.1 kHz
        // channels    : mono (if it's music use stereo)
        // bit depth   : 16 bit
        .format("ogg")
        .audioCodec("libvorbis")
        .audioQuality(3)
        .audioFrequency(44100)
        .audioChannels(req.query.stereo === "1" ? 2 : 1)
        .noVideo()
        .on("start", (cmd) => {
          console.log({ cmd });
        })
        .on("stderr", (stderr) => {
          console.warn(stderr);
        })
        .on("end", resolve)
        .on("error", reject)
        .save(output.name);
    });

    console.log("converted succesfully");

    await new Promise((resolve, reject) => {
      pump(fs.createReadStream(output.name), res, (err) => {
        input.removeCallback();
        output.removeCallback();

        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  } catch (err: any) {
    console.warn(err.message);
    res.status(500);
    res.send(err.message);
  }
});

const listener = app.listen(process.env.PORT ?? 8080, () => {
  const address = listener.address();
  if (!address) throw new Error("??");

  if (typeof address === "string") {
    console.log("Your app is listening on address " + address);
  } else {
    console.log("Your app is listening on port " + address.port);
  }
});
