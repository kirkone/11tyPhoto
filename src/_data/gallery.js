const EleventyFetch = require("@11ty/eleventy-fetch");
const config = require("./config")

module.exports = async function() {
    const ondriveUri = config.onedriveShareUri;
    console.log('---OneDriveURI-----\n', ondriveUri)

    const ondriveUriEncoded = Buffer.from(ondriveUri).toString('base64')
    console.log('---ENCODED-----\n', ondriveUriEncoded)

    shareId = "u!" + ondriveUriEncoded.replace(new RegExp("[=]*$"), '').replace('/', '_').replace('+', '-');
    console.log('---ShareId-----\n', shareId)

    const url = "https://api.onedrive.com/v1.0/shares/" + shareId + "/root/children?$top=2147483647&$filter=startswith(file/mimeType,'image')&$select=name,description,image,photo,@content.downloadUrl&$orderby=photo/takenDateTime asc"
    console.log('---Url-----\n', url)

    const response = await EleventyFetch(
        url,
        {
            duration: "1s",
            type: "json"
        }
    );

    const images = response.value.map(image => ({
        src: image['@content.downloadUrl'],
        name: image.name,
        description: image.description,
        photo: image.photo,
        size: image.image,
        date: new Date(image.photo.takenDateTime)
    })).sort((a, b) => a.date.getFullYear() - b.date.getFullYear()).reverse();

    const years = [...new Set(images.map((item) => item.date.getFullYear()))].sort().reverse();

    const x = response.value.map((item) => item);
    x.forEach(e => {
        const d = Date.parse(e.photo.takenDateTime);

        if (isNaN(d)) {
            console.log('---Error-----\n', e);
        }
    });

    console.log('---Years-----\n', years)

    return new Promise((resolve, reject) => {
        resolve(
            {
                images: images,
                years: years
            }
        );
    });
};