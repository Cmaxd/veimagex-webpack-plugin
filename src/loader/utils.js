const ImagexClient = require('vcloud-sdk-nodejs/lib/services/imagex');

const RegionMap = {
  cn: 'https://imagex.bytedanceapi.com',
  sg: 'https://open.ap-singapore-1.bytedanceapi.com',
  us: 'https://open.us-east-1.bytedanceapi.com',
  boe: 'https://staging-openapi-boe.byted.org',
  boei18n: 'https://staging-openapi-boei18n.byted.org',
};

function normalizePath(path, stripTrailing) {
  if (path === '\\' || path === '/') {
    return '/';
  }

  const len = path.length;

  if (len <= 1) {
    return path;
  }

  // ensure that win32 namespaces has two leading slashes, so that the path is
  // handled properly by the win32 version of path.parse() after being normalized
  // https://msdn.microsoft.com/library/windows/desktop/aa365247(v=vs.85).aspx#namespaces
  let prefix = '';

  if (len > 4 && path[3] === '\\') {
    // eslint-disable-next-line prefer-destructuring
    const ch = path[2];

    if ((ch === '?' || ch === '.') && path.slice(0, 2) === '\\\\') {
      // eslint-disable-next-line no-param-reassign
      path = path.slice(2);
      prefix = '//';
    }
  }

  const segs = path.split(/[/\\]+/);

  if (stripTrailing !== false && segs[segs.length - 1] === '') {
    segs.pop();
  }

  return prefix + segs.join('/');
}

async function retry(asyncFunction, query = {}, options) {
  const iterator = Array(3).fill('');
  for (const [index] of iterator.entries()) {
    try {
      /* eslint-disable no-await-in-loop */
      const data = await asyncFunction(query);
      return data;
    } catch (e) {
      console.error(`${options.originUrl}: upload failed ${index + 1}: ${e}`);
    }
  }
  console.error(`${options.originUrl}: all retry failed`);
  return null;
}

async function uploadImage(file, options = {}, callback = () => {}) {
  const client = new ImagexClient({
    accesskey: options.accessKey,
    secretkey: options.secretKey,
    endpoint: RegionMap[options.region || 'cn'] || RegionMap.cn,
  });
  try {
    const res = await retry(
      client.UploadImages,
      {
        serviceId: options.serviceId,
        files: [file],
      },
      { originUrl: options.originUrl }
    );
    let url = null;
    if (res && Array.isArray(res.Results) && res.Results[0]) {
      url = res.Results[0].Uri;
      console.log(`${options.originUrl}: upload success`);
    }
    callback(url);
  } catch (e) {
    console.error(e);
    callback(null);
  }
}

// eslint-disable-next-line import/prefer-default-export
export { normalizePath, uploadImage, retry };
