const fs = require("fs");
const express = require("express");
const ffmpeg = require("fluent-ffmpeg");
const tmp = require("tmp");
const pump = require("pump");

const app = express();

app.use(express.static("public"));

app.post("/convert", async (req, res) => {
  const input = tmp.fileSync();
  console.log("/convert", input.name);

  try {
    await new Promise((resolve, reject) => {
      pump(req, fs.createWriteStream(input.name), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const output = tmp.fileSync();
    console.log("converting", input.name, output.name);

    await new Promise((resolve, reject) => {
      ffmpeg(input.name)
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
        .on("end", resolve)
        .on("error", reject)
        .save(output.name);
    });

    console.log("converted succesfully");
    pump(fs.createReadStream(output.name), res, (err) => {
      input.removeCallback();
      output.removeCallback();

      if (err) {
        reject(err);
      }
    });
  } catch (err) {
    console.warn(err.message);
    res.status(500);
    res.send(err.message);
  }
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
