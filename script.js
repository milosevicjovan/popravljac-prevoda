let subtitleText = "";
let subtitleFileName = "";
let subtitleFileExtension = "";

const fixedSubtitlePrefix = "IspravljenPrevod_"

const validExtensions = ["srt", "sub", "txt", "ssa", "ttml", "sbv", "dfxp", "vtt"];

function resetSettings() {
    subtitleText = "";
    subtitleFileName = "";
    subtitleFileExtension = "";
    fileToLoad.value = "";
}

function displayError(errorText, errorDescription) {
    document.getElementById("error-text").innerHTML = errorText;
    document.getElementById("error-description").innerHTML = errorDescription;
    let errorButton = document.getElementById("modal-button");
    errorButton.click();
}

function validExtensionsDescription() {
    let description = "Podržane ekstenzije:";
    for (let i = 0; i < validExtensions.length - 1; i++) {
        description += " <strong>" + validExtensions[i] + "</strong>,"
    }
    description = description.slice(0, -1) + " i <strong>" +
        validExtensions[validExtensions.length - 1] + "</strong>.";
    return description;
}

function fixSubtitle() {
    const loadFileAsText = new Promise(function (resolve, reject) {

        let fileToLoad = document.getElementById("fileToLoad").files[0];

        if (!fileToLoad) {
            document.getElementById("fileToLoad").focus();
            displayError("Fajl sa prevodom nije izabran!", "Morate prvo izabrati fajl.");
            return;
        }

        let fileReader = new FileReader();

        fileReader.onload = function (fileLoadedEvent) {
            subtitleText = fileLoadedEvent.target.result;
            subtitleFileName = fixedSubtitlePrefix + fileToLoad.name;
            subtitleFileExtension = subtitleFileName.split('.').pop().toLowerCase();

            if (!validExtensions.includes(subtitleFileExtension)) {
                resetSettings();
                displayError("Izabrani fajl sa prevodom nije validan! Ekstenzija nije podržana.",
                    validExtensionsDescription());
                return;
            }

            if (!subtitleFileName || !subtitleText || !subtitleFileExtension
                || subtitleFileName.length === 0 || subtitleText.length === 0
                || subtitleFileExtension.length === 0) {
                resetSettings();
                displayError("Fajl sa prevodom nije ispravan.", "");
                return;
            }

            const characterCodes = [230, 232, 240, 198, 200, 208];
            const characters = ['ć', 'č', 'đ', 'Ć', 'Č', 'Đ']

            for (let i = 0; i < characterCodes.length; i++) {
                let pattern = String.fromCharCode(characterCodes[i]),
                    result = new RegExp(pattern, "g");
                subtitleText = subtitleText.replace(result, characters[i]);
            }

            resolve({ "fileName": subtitleFileName, "text": subtitleText });
        };

        fileReader.readAsText(fileToLoad, 'ISO-8859-1');

    }).then(subtitle => {
        downloadFixedSubtitle(subtitle.text, subtitle.fileName);
        let downloadLink = document.getElementById("download-link");
        downloadLink.click();
    }).catch(error => {
        displayError("Došlo je do greške.", error);
    });
}

function downloadFixedSubtitle(subtitleText, subtitleName) {
    let downloadLink = document.getElementById("download-link");
    let file = new Blob([subtitleText], { type: "text/plain" });
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.download = subtitleName;
}