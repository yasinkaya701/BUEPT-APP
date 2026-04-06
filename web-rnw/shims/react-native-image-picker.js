function getImageMeta(dataUrl) {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve({ width: 0, height: 0 });
      return;
    }
    const img = new Image();
    img.onload = () => resolve({ width: Number(img.width || 0), height: Number(img.height || 0) });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = dataUrl;
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || typeof FileReader === 'undefined') {
      reject(new Error('FileReader is unavailable'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read selected image.'));
    reader.readAsDataURL(file);
  });
}

function openImageDialog({ capture = false } = {}) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve({ didCancel: true, assets: [] });
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (capture) input.capture = 'environment';
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.opacity = '0';

    const cleanup = () => {
      try {
        input.remove();
      } catch (_) {
        // ignore
      }
    };

    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) {
        cleanup();
        resolve({ didCancel: true, assets: [] });
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
        const { width, height } = await getImageMeta(dataUrl);
        cleanup();
        resolve({
          didCancel: false,
          assets: [{
            uri: dataUrl,
            base64,
            type: file.type || 'image/jpeg',
            fileName: file.name || 'image.jpg',
            fileSize: Number(file.size || 0),
            width,
            height,
          }],
        });
      } catch (error) {
        cleanup();
        resolve({
          didCancel: false,
          errorCode: 'file_read_error',
          errorMessage: String(error?.message || 'Could not process selected image.'),
          assets: [],
        });
      }
    };

    document.body.appendChild(input);
    input.click();
  });
}

async function launchImageLibrary() {
  return openImageDialog({ capture: false });
}

async function launchCamera() {
  return openImageDialog({ capture: true });
}

module.exports = {
  launchImageLibrary,
  launchCamera,
};
module.exports.default = module.exports;
