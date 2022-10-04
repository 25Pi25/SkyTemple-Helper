const fs = require('fs');
const Jimp = require('jimp');
const xml2js = require('xml2js');
const getPixels = require('get-pixels');
const convertPixels = require('image-output');
const util = require('util');
const getPixelsAsync = util.promisify(getPixels);

exports.handler = async (event, size, path) => {
    try {
        const greenpixel = [0, 255, 0, 255]
        const blankpixel = new Array(4).fill(0)
        const whitepixel = new Array(4).fill(255)

        const AnimData = fs.readFileSync(`${path}/AnimData.xml`, 'utf-8')
        const AnimDataXML = await xml2js.parseStringPromise(AnimData)

        const dirs = fs.readdirSync(`${path}`)
        let totalAnims = 0;
        for (const file of dirs) {
            if (file == 'AnimData.xml') continue;
            let method = 0;
            if (file.replace(/\.png/).includes('Shadow')) method = 1;
            if (file.replace(/\.png/).includes('Offsets')) method = 2;
            scaleFile(file.replace(/\.png/g, ""), method)
            totalAnims++;
        }

        const splitAnimData = AnimData.split(/(?=<FrameWidth>|<\/FrameWidth>|<FrameHeight>|<\/FrameHeight>)/g)
        //Replace frame width and frame height with a doubled number
        for (let i = 1; i < splitAnimData.length; i += 2) {
            const number = splitAnimData[i].split(/(<FrameWidth>|<FrameHeight>)/g)
            splitAnimData[i] = number[1] + `${parseInt(number[2]) * size}`
        }
        if (!fs.existsSync(`${path}`)) fs.mkdirSync(`${path}`)
        fs.writeFileSync(`${path}/AnimData.xml`, splitAnimData.join("\n"))

        async function scaleFile(file, method) {
            const tempPath = `${file}-temp.png`
            const buffer = fs.readFileSync(`${path}/${file}.png`)

            const anim = AnimDataXML.AnimData.Anims[0].Anim.find(x => x.Name[0] === file.split('-')[0])
            const frameWidth = anim.FrameWidth[0] * size * anim.Durations[0].Duration.length

            const pixelLocations = [];
            fs.writeFileSync(tempPath, buffer)
            if (size < 1) { if (method >= 1) await editPixels(); await editSize(); if (method >= 1) await fixPixels(); }
            else {await editSize(); await editPixels();}
            fs.writeFileSync(`${path}/${file}.png`, fs.readFileSync(tempPath))
            fs.unlinkSync(tempPath)
            console.log(`Finished ${file}`)
            totalAnims--;

            async function editSize() {
                const buffering = await Jimp.read(buffer)
                //Scale image by x2
                buffering.scale(parseFloat(size), Jimp.RESIZE_NEAREST_NEIGHBOR)
                const buffers = await buffering.getBufferAsync(Jimp.MIME_PNG)
                fs.writeFileSync(tempPath, buffers)
                return;
            }
            async function fixPixels() {
                const pixels = await getPixelsAsync(tempPath, "image/png")
                const properPixels = []
                //Group pixels into fours
                for (let i = 0; i < pixels.data.length; i++) {
                    const area = properPixels[Math.floor(i / 4)]
                    if (!area) properPixels[Math.floor(i / 4)] = []
                    properPixels[Math.floor(i / 4)].push(pixels.data[i])
                }

                //Destroy groups of white pixels in shadows
                const roundedLocations = pixelLocations.map(x => x.map(x => typeof x == 'number' ? Math.round(x / 2) : x))
                if (method === 1) properPixels.forEach((pixel, index) => {
                    if (roundedLocations.some(x => x[0] + x[1] * frameWidth == index)) {
                        properPixels[index] = [...whitepixel]
                        //pixelLocations.shift();
                    }
                })
                if (method === 2) properPixels.forEach((pixel, index) => {
                    const findLocation = roundedLocations.find(x => x[0] + x[1] * frameWidth == index)
                    if (findLocation) properPixels[index] = [...findLocation[2]]
                })

                pixels.data = properPixels.flat()
                const arrayBufferFromPixels = convertPixels({
                    data: pixels.data,
                    width: frameWidth,
                    height: properPixels.length / frameWidth
                })
                fs.writeFileSync(tempPath, toBuffer(arrayBufferFromPixels))
                return;
            }

            async function editPixels() {
                const pixels = await getPixelsAsync(tempPath, "image/png")
                const properPixels = []
                //Group pixels into fours
                for (let i = 0; i < pixels.data.length; i++) {
                    const area = properPixels[Math.floor(i / 4)]
                    if (!area) properPixels[Math.floor(i / 4)] = []
                    properPixels[Math.floor(i / 4)].push(pixels.data[i])
                }

                //Destroy groups of white pixels in shadows
                if (method === 1) properPixels.forEach((pixel, index) => {
                    if ([255, 255, 255, 255].every((x, index) => x === pixel[index])) {
                        if (properPixels[index + 1][0] == 0 && size > 1) return;
                        switch (size) {
                            case 0.5:
                                pixelLocations.push([index % (frameWidth * 2), Math.floor(index / frameWidth / 2)])
                                properPixels[index] = [...greenpixel]
                                break;
                            case 3:
                                //Scale 3 will also remove the rest of them
                                properPixels[index + 2] = [...greenpixel]
                                properPixels[index + frameWidth + 2] = [...greenpixel]
                                properPixels[index + frameWidth * 2] = [...greenpixel]
                                properPixels[index + frameWidth * 2 + 1] = [...greenpixel]
                                properPixels[index + frameWidth * 2 + 2] = [...greenpixel]
                            case 2:
                                //Pixels 1-4, leave 1 to not be omitted
                                properPixels[index] = [...greenpixel]
                                properPixels[index + 1] = [...greenpixel]
                                properPixels[index + frameWidth] = [...greenpixel]
                                //properPixels[index + frameWidth + 1] = [...greenpixel]
                        }
                    }
                })

                //Destroy groups of colored pixels in offsets
                if (method === 2) properPixels.forEach((pixel, index) => {
                    if (pixel[3] != 0) {
                        if (size > 1 && properPixels[index + 1][3] == 0) return;
                        switch (size) {
                            case 0.5:
                                pixelLocations.push([index % (frameWidth * 2), Math.floor(index / frameWidth / 2), [...pixel]])
                                properPixels[index] = [...greenpixel]
                                break;
                            case 3:
                                properPixels[index + 2] = [...blankpixel]
                                properPixels[index + frameWidth + 2] = [...blankpixel]
                                properPixels[index + frameWidth * 2] = [...blankpixel]
                                properPixels[index + frameWidth * 2 + 1] = [...blankpixel]
                                properPixels[index + frameWidth * 2 + 2] = [...blankpixel]
                            case 2:
                                //Pixels 1-4, leave 1 to not be omitted
                                properPixels[index] = [...blankpixel]
                                properPixels[index + 1] = [...blankpixel]
                                properPixels[index + frameWidth] = [...blankpixel]
                            //properPixels[index + frameWidth + 1] = [...blankpixel]
                        }
                    }
                })

                pixels.data = properPixels.flat()
                const arrayBufferFromPixels = convertPixels({
                    data: pixels.data,
                    width: frameWidth,
                    height: properPixels.length / frameWidth
                })
                fs.writeFileSync(tempPath, toBuffer(arrayBufferFromPixels))
                return;
            }
        }
        const timeout = setInterval(() => {
            console.log(totalAnims)
            if(totalAnims == 0) {
                clearInterval(timeout); 
                mainWindow.webContents.send('alert', true)
                mainWindow.webContents.send('enableButton', 'scaler')
                return;
            }
        }, 100);
    } catch {
        mainWindow.webContents.send('alert', false)
        mainWindow.webContents.send('enableButton', 'scaler')
    }
}

function toBuffer(ab) {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}