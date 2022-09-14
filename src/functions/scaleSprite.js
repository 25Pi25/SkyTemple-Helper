const fs = require('fs');
const Jimp = require('jimp');
const xml2js = require('xml2js');
const getPixels = require('get-pixels');
const convertPixels = require('image-output');

exports.handler = async (event, size, path) => {
    try {
        size = true ? 3 : 2
        const AnimData = fs.readFileSync(`${path}/AnimData.xml`, 'utf-8')
        const AnimDataXML = await xml2js.parseStringPromise(AnimData)

        const dirs = fs.readdirSync(`${path}`)

        const promises = [];
        for (const file of dirs) {
            if (file == 'AnimData.xml') continue;
            let method = 0;
            if (file.replace(/\.png/).includes('Shadow')) method = 1;
            if (file.replace(/\.png/).includes('Offsets')) method = 2;
            scaleFile(file.replace(/\.png/g, ""), method)
            promises.push("")
        }

        const splitAnimData = AnimData.split(/(?=<FrameWidth>|<\/FrameWidth>|<FrameHeight>|<\/FrameHeight>)/g)
        //Replace frame width and frame height with a doubled number
        for (let i = 1; i < splitAnimData.length; i += 2) {
            const number = splitAnimData[i].split(/(<FrameWidth>|<FrameHeight>)/g)
            splitAnimData[i] = number[1] + `${parseInt(number[2]) * size}`
        }
        fs.writeFileSync(`${path}/AnimData.xml`, splitAnimData.join("\n"))

        async function scaleFile(file, method) {
            const buffer = fs.readFileSync(`${path}/${file}.png`)
            const buffering = await Jimp.read(buffer)
            //Scale image by x2
            buffering.scale(parseFloat(size), Jimp.RESIZE_NEAREST_NEIGHBOR)
            const buffers = await buffering.getBufferAsync(Jimp.MIME_PNG)
            fs.writeFileSync(`${path}/${file}-temp.png`, buffers)

            const anim = AnimDataXML.AnimData.Anims[0].Anim.find(x => x.Name[0] === file.split('-')[0])
            const frameWidth = anim.FrameWidth[0] * size * anim.Durations[0].Duration.length
            getPixels(`${path}/${file}-temp.png`, (err, pixels) => {
                fs.unlinkSync(`${path}/${file}-temp.png`)
                const properPixels = []
                //Group pixels into fours
                for (let i = 0; i < pixels.data.length; i++) {
                    const area = properPixels[Math.floor(i / 4)]
                    if (!area) properPixels[Math.floor(i / 4)] = []
                    properPixels[Math.floor(i / 4)].push(pixels.data[i])
                }

                //Destroy groups of white pixels in shadows
                const greenpixel = [0, 255, 0, 255]
                if (method === 1) properPixels.forEach((pixel, index) => {
                    if ([255, 255, 255, 255].every((x, index) => x === pixel[index])) {
                        if (properPixels[index + 1][0] == 0) return;
                        //Pixels 1-4, leave 1 to not be omitted
                        properPixels[index] = [...greenpixel]
                        properPixels[index + 1] = [...greenpixel]
                        properPixels[index + frameWidth] = [...greenpixel]
                        //properPixels[index + frameWidth + 1] = [...greenpixel]
                        //Scale 3 will also remove the rest of them
                        if (size == 3) {
                            properPixels[index + 2] = [...greenpixel]
                            properPixels[index + frameWidth + 2] = [...greenpixel]
                            properPixels[index + frameWidth * 2] = [...greenpixel]
                            properPixels[index + frameWidth * 2 + 1] = [...greenpixel]
                            properPixels[index + frameWidth * 2 + 2] = [...greenpixel]
                        }
                    }
                })

                //Destroy groups of colored pixels in offsets
                const blankpixel = new Array(4).fill(0)
                if (method === 2) properPixels.forEach((pixel, index) => {
                    if (pixel[3] != 0) {
                        if (properPixels[index + 1][3] == 0) return;
                        //Pixels 1-4, leave 1 to not be omitted
                        properPixels[index] = [...blankpixel]
                        properPixels[index + 1] = [...blankpixel]
                        properPixels[index + frameWidth] = [...blankpixel]
                        //properPixels[index + frameWidth + 1] = [...blankpixel]
                        if (size == 3) {
                            properPixels[index + 2] = [...blankpixel]
                            properPixels[index + frameWidth + 2] = [...blankpixel]
                            properPixels[index + frameWidth * 2] = [...blankpixel]
                            properPixels[index + frameWidth * 2 + 1] = [...blankpixel]
                            properPixels[index + frameWidth * 2 + 2] = [...blankpixel]
                        }
                    }
                })

                pixels.data = properPixels.flat()
                convertPixels({
                    data: pixels.data,
                    width: frameWidth,
                    height: properPixels.length / frameWidth
                }, `${path}/${file}.png`)
                console.log(`Finished ${file}`)
                promises.shift()
            })
        }
        const timeout = setInterval(() => {
            if(promises.length == 0) {
                clearInterval(timeout); 
                mainWindow.webContents.send('alert', true)
                mainWindow.webContents.send('enableButton', 'scaler')
            }
        }, 100);
    } catch { 
        mainWindow.webContents.send('alert', false) 
        mainWindow.webContents.send('enableButton', 'scaler')
    }
}