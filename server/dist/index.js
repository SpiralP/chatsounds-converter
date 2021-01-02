"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const tmp_1 = __importDefault(require("tmp"));
const pump_1 = __importDefault(require("pump"));
const app = express_1.default();
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "..", "client", "dist")));
app.post("/convert", async (req, res) => {
    const input = tmp_1.default.fileSync();
    console.log("/convert", input.name);
    try {
        await new Promise((resolve, reject) => {
            pump_1.default(req, fs_1.default.createWriteStream(input.name), (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(undefined);
                }
            });
        });
        const output = tmp_1.default.fileSync();
        console.log("converting", input.name, output.name);
        await new Promise((resolve, reject) => {
            fluent_ffmpeg_1.default(input.name)
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
        await new Promise((resolve, reject) => {
            pump_1.default(fs_1.default.createReadStream(output.name), res, (err) => {
                input.removeCallback();
                output.removeCallback();
                if (err) {
                    reject(err);
                }
                else {
                    resolve(undefined);
                }
            });
        });
    }
    catch (err) {
        console.warn(err.message);
        res.status(500);
        res.send(err.message);
    }
});
const listener = app.listen(process.env.PORT ?? 8080, () => {
    const address = listener.address();
    if (!address)
        throw new Error("??");
    if (typeof address === "string") {
        console.log("Your app is listening on address " + address);
    }
    else {
        console.log("Your app is listening on port " + address.port);
    }
});
//# sourceMappingURL=index.js.map