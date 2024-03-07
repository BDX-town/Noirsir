import { Media } from 'types/src/Media';
import { WebdavClient, WebdavFile } from '../types/webdav';
import { buildUrl } from '../helpers/buildUrl';
import { fetchAdapter } from './fetch';
import { AppError, declareError } from '../data/AppError';

export function deserializeMedia(m: Media): Media {
    return {
        ...m,
        updatedAt: new Date(m.updatedAt)
    }
}


export const PARSE_MEDIA_FAIL = declareError('Unable to retrieve your media. There is maybe something wrong on our end but please check your connection.');
export const PARSE_MEDIA_DENY = declareError('You do not have access to this media. Please check your credentials.');
export const PARSE_MEDIA_NOTFOUND = declareError('The requested media does not exsist (anymore ?).')
export const PARSE_MEDIA_FORMAT = declareError('The requested media is malformed. Please try to reupload it.');
async function parseMedia(client: WebdavClient, file: WebdavFile): Promise<Media> {
    const response = await fetchAdapter(client.getFileContents, `/${import.meta.env.VITE_BLOGS_PATH}/${client.username}/ressources/${file.basename}`);

    if(!response.ok) {
        let code = PARSE_MEDIA_FAIL;
        if(response.status === 401 || response.status === 403) code = PARSE_MEDIA_DENY;
        else if(response.status === 404) code = PARSE_MEDIA_NOTFOUND;
        throw new AppError(code, `${response.status}: ${response.statusText}`)
    }
    const content = await response.arrayBuffer();
    try {
        return {
            file: file.basename,
            updatedAt: new Date(file.lastmod),
            weight: file.size,
            url: buildUrl(file.filename),
            content,
        }
    } catch (e) {
        throw new AppError(PARSE_MEDIA_FORMAT, (e as object).toString());
    }
}


export const PUT_MEDIA_FAIL = declareError('Unable to save your media. There is maybe something wrong on our end, but please check your connection.');
export const PUT_MEDIA_DENY = declareError('You do not have access to this media. Please check your credentials.');
export const PUT_MEDIA_FALSE = declareError('Your media was not saved. Please report this issue to your administrator.');
export async function putMedia(client: WebdavClient, media: Media) {
    const response = await fetchAdapter(client.putFileContents, `/${import.meta.env.VITE_BLOGS_PATH}/${client.username}/ressources/${media.file}`, media.content, { overwrite: true, contentLength: media.weight });
    if(!response.ok) {
        let code = PUT_MEDIA_FAIL;
        if(response.status === 401 || response.status === 403) {
            code = PUT_MEDIA_DENY;
        }
        throw new AppError(code, `${response.status}: ${response.statusText}`)
    }
    let result = false;
    try {
        result = await response.json();
    } catch (e) {
        throw new AppError(PUT_MEDIA_FAIL, (e as Error).message || (e as object).toString())
    }
    if(!result) throw new AppError(PUT_MEDIA_FALSE, 'There is something wrong with the filesystem, since overwrite is true.');
    return {
        ...media,
        url: buildUrl(`/${import.meta.env.VITE_BLOGS_PATH}/${client.username}/ressources/${media.file}`),
    }
}

export const DELETE_MEDIA_FAIL = declareError('Unable to delete your media. There is maybe something wrong on our end but please check your connection.');
export const DELETE_MEDIA_DENY = declareError('You do not have access to this media. Please check your credentials.');
export async function deleteMedia(client: WebdavClient, media: Media) {
    const response = await fetchAdapter(client.deleteFile, `/${import.meta.env.VITE_BLOGS_PATH}/${client.username}/ressources/${media.file}`);
    if(!response.ok && response.status !== 404) {
        let code = DELETE_MEDIA_FAIL;
        if(response.status === 401 || response.status === 403) code = DELETE_MEDIA_DENY;
        throw new AppError(code, `${response.status}: ${response.statusText}`)
    }
} 

export const FETCH_MEDIA_FAIL = declareError('Unable to retrieve your media directory. There is maybe something wrong on our end but please check your connection.');
export const FETCH_MEDIA_DENY = declareError('You do not have access to these media. Please check your credentials.');
export const FETCH_MEDIA_NOTFOUND = declareError('The requested media directory does not exsist (anymore ?). Please notice this issue to your administrator.')
export async function fetchMedia(client: WebdavClient): Promise<Media[]> {
    const response = await fetchAdapter(client.getDirectoryContents, `/${import.meta.env.VITE_BLOGS_PATH}/${client.username}/ressources`);

    if(!response.ok) {
        let code = FETCH_MEDIA_FAIL;
        if(response.status === 401 || response.status === 403) code = FETCH_MEDIA_DENY;
        else if(response.status === 404) code = FETCH_MEDIA_NOTFOUND;
        throw new AppError(code, `${response.status}: ${response.statusText}`)
    }
    let files: WebdavFile[] = [];
    try {
        files = await response.json();
    } catch (e) {
        // json badly dormated
        const error = e as Error;
        throw new AppError(FETCH_MEDIA_FAIL, error.message || (e as object).toString())
    }
    // dont know why folder is sometimes shown as file
    return Promise.all(files.map((f) => parseMedia(client, f)));
}