// Generates a blob of silent audio used for Audio sources
const generateSilentAudioUrl = (seconds = 1) => {
    const sampleRate = 44100;
    const totalChannels = 1;
    const frameCount = sampleRate * seconds;
    const buffer = new ArrayBuffer(44 + frameCount * 2);
    const view = new DataView(buffer);

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    // RIFF header
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + frameCount * 2, true);
    writeString(view, 8, "WAVE");

    // fmt subchunk
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, totalChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * totalChannels * 2, true);
    view.setUint16(32, totalChannels * 2, true);
    view.setUint16(34, 16, true);

    // data subchunk
    writeString(view, 36, "data");
    view.setUint32(40, frameCount * 2, true);

    // Create object URL
    return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}
