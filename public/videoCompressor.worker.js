// Web Worker for background video compression using ffmpeg.wasm

let ffmpeg = null;

self.onmessage = async function(e) {
  const { file, quality } = e.data;
  if (!file) {
    self.postMessage({ type: 'error', error: 'No file provided' });
    return;
  }

  try {
    // 1. Dynamically load the minified FFmpeg wrapper from CDN if not already loaded
    if (!self.FFmpeg) {
      self.postMessage({ type: 'progress', progress: 5, message: 'Loading compression engine...' });
      importScripts('https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js');
    }

    const { createFFmpeg } = self.FFmpeg;

    if (!ffmpeg) {
      ffmpeg = createFFmpeg({
        log: true,
        // Critical: Using the single-threaded build of ffmpeg-core avoids requiring SharedArrayBuffer.
        // This ensures compatibility across all browsers (including Safari and mobile Chrome)
        // without needing custom COOP/COEP cross-origin headers in Vercel.
        corePath: 'https://unpkg.com/@ffmpeg/core-singlethread@0.11.0/dist/ffmpeg-core.js'
      });
    }

    if (!ffmpeg.isLoaded()) {
      self.postMessage({ type: 'progress', progress: 15, message: 'Initializing media codecs...' });
      await ffmpeg.load();
    }

    self.postMessage({ type: 'progress', progress: 25, message: 'Reading video stream...' });
    const arrayBuffer = await file.arrayBuffer();
    ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(arrayBuffer));

    self.postMessage({ type: 'progress', progress: 35, message: 'Compressing...' });

    // Set resolution quality ceiling target
    // 720p with crf 28, preset ultrafast for fast mobile compilation
    const scaleFilter = quality === '540p' ? 'scale=-2:540' : 'scale=-2:720';
    
    // Set progress callback
    ffmpeg.setProgress(({ ratio }) => {
      // ratio goes from 0 to 1
      const progressPercent = Math.min(90, Math.floor(35 + ratio * 55));
      self.postMessage({ 
        type: 'progress', 
        progress: progressPercent, 
        message: `Compressing (${Math.floor(ratio * 100)}%)...` 
      });
    });

    // Run H.264 MP4 conversion
    // -vf scale=-2:720: Resizes height to 720px, auto widths to even integer
    // -vcodec libx264: H.264 video codec
    // -crf 28: Balance quality and file size
    // -preset ultrafast: Maximum execution speed to prevent timeout on client
    // -acodec aac -b:a 64k: Optimize audio track to AAC 64kbps
    // -movflags +faststart: Relocates metadata to front of MP4 file for instant video streaming
    await ffmpeg.run(
      '-i', 'input.mp4',
      '-vf', scaleFilter,
      '-vcodec', 'libx264',
      '-crf', '28',
      '-preset', 'ultrafast',
      '-acodec', 'aac',
      '-b:a', '64k',
      '-movflags', '+faststart',
      'output.mp4'
    );

    self.postMessage({ type: 'progress', progress: 95, message: 'Finalizing optimized media...' });

    const data = ffmpeg.FS('readFile', 'output.mp4');
    const compressedBlob = new Blob([data.buffer], { type: 'video/mp4' });

    // Clean virtual file system to prevent memory leaks
    try {
      ffmpeg.FS('unlink', 'input.mp4');
      ffmpeg.FS('unlink', 'output.mp4');
    } catch (fsErr) {
      console.warn('[Worker] FS cleanup warning:', fsErr);
    }

    self.postMessage({
      type: 'done',
      blob: compressedBlob,
      originalSize: file.size,
      compressedSize: compressedBlob.size
    });

  } catch (err) {
    console.error('[Worker] Error during video compression:', err);
    self.postMessage({ 
      type: 'error', 
      error: err.message || 'Media encoding failed. Check that your file is not corrupted.' 
    });
  }
};
