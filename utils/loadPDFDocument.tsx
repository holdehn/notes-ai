import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const convertVideoToMp3 = async (videoFile: string | Blob | Buffer) => {
  try {
    // Create an FFmpeg instance
    const ffmpeg = createFFmpeg({ log: true });

    // Load the FFmpeg instance
    await ffmpeg.load();
    const file = videoFile as File;

    // Write the video file to FFmpeg's file system
    const inputFileName =
      file?.type.split('/')[1] === 'webm' ? 'input.webm' : 'input.mp4';
    ffmpeg.FS('writeFile', inputFileName, await fetchFile(videoFile));

    // Run the FFmpeg command to convert the video to MP3
    await ffmpeg.run('-i', inputFileName, '-vn', '-b:a', '128k', 'output.mp3');

    // Read the output MP3 file from FFmpeg's file system
    const audioData = ffmpeg.FS('readFile', 'output.mp3');

    // Create a Blob from the output MP3 data
    const audioBlob = new Blob([audioData.buffer], { type: 'audio/mp3' });

    // Convert the Blob to a File
    const audioFile = new File([audioBlob], 'audio.mp3', {
      type: 'audio/mp3',
    });

    // Return the audio file
    return audioFile;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { convertVideoToMp3 };
