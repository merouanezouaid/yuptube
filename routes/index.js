var express = require("express");
var router = express.Router();

// default endpoint
router.get("/", function (req, res) {
  res.render("index", { title: "YupTube | Your favorite Youtube Converter" });
  // new endpoint
});

router.get("*", function (req, res) {
  res.render("page404", { title: "404 not found | YupTube" });
  // new endpoint
});

function bytesToSize(bytes) {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

const ytdl = require("youtube-dl-exec");
const mql = require("@microlink/mql");

const pattern =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

router.post("/video", async (req, res, next) => {
  if (pattern.test(req.body.url)) {
    const url = req.body.url,
      formats = [];

    // API for audios
    const audio = await mql(url, { audio: true });
    // console.log(audio.data);
    const { status, data } = await mql(url, { video: true });
    // console.log(JSON.stringify(data));
    data.video.size = data.video.size
      ? bytesToSize(data.video.size)
      : "unknown";
    audio.data.audio.size = audio.data.audio.size
      ? bytesToSize(audio.data.audio.size)
      : "unknown";

    await formats.push(audio.data);
    await formats.push(data);
    console.log(formats);

    res.render("listvideo", {
      title: `Video Converted : ${data.title}`,
      meta: { id: data.url, formats: formats },
    });
  } else {
    res.render("listvideo", {
      error:
        "The link you provided either not a valid url or it is not acceptable",
    });
  }

  // // YouTube DL
  // ytdl(url, {
  //   dumpSingleJson: true,
  //   noWarnings: true,
  //   noCallHome: true,
  //   noCheckCertificate: true,
  //   preferFreeFormats: true,
  //   youtubeSkipDashManifest: true,
  //   referer: url,
  // })
  //   .then((output) => {
  //     console.log(output);
  //     output.formats.forEach((item) => {
  //       // if (item.format_note !== "DASH audio" && item.filesize) {
  //       item.filesize = item.filesize ? bytesToSize(item.filesize) : "unknown";
  //       formats.push(item);
  //       // }
  //     });
  //     res.render("listvideo", { meta: { id: output.id, formats: formats } });
  //   })
  //   .catch((err) =>
  //     res.render("listvideo", {
  //       error:
  //         "The link you provided either not a valid url or it is not acceptable",
  //     })
  //   );

  // ytdl(url, {
  //   youtubeSkipDashManifest: true,
  // }).then((output) => {
  //   console.log(output);
  //   if (err)
  //     return res.render("listvideo", {
  //       error:
  //         "The link you provided either not a valid url or it is not acceptable",
  //     });
  //   output.formats.forEach(function (item) {
  //     if (item.format_note !== "DASH audio" && item.filesize) {
  //       item.filesize = item.filesize ? bytesToSize(item.filesize) : "unknown";
  //       formats.push(item);
  //     }
  //   });
  //   console.log(output);
  //   res.render("listvideo", { meta: { id: info.id, formats: formats } });
  // });
});

module.exports = router;
