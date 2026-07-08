import { get, set, del, keys } from 'idb-keyval';

const PHOTO_PREFIX = 'photo:';
const INDEX_KEY = 'photoIndex';

export async function savePhoto(id, dataUrl) {
  await set(PHOTO_PREFIX + id, dataUrl);
}

export async function loadPhoto(id) {
  return get(PHOTO_PREFIX + id);
}

export async function deletePhoto(id) {
  await del(PHOTO_PREFIX + id);
}

export async function loadPhotoIndex() {
  const idx = await get(INDEX_KEY);
  return idx || [];
}

export async function savePhotoIndex(index) {
  await set(INDEX_KEY, index);
}

export async function allPhotoKeys() {
  const all = await keys();
  return all.filter((k) => String(k).startsWith(PHOTO_PREFIX));
}
