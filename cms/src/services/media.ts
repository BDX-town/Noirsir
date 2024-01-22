import { Media } from '../types/Media';
import { WebdavFile } from '../types/webdav';
import { Blog } from '../types/Blog';
import { CURRENT_BLOG } from './client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function parseMedia(client: any, file: WebdavFile): Promise<Media> {
    return {
        file: file.file,
        updatedAt: new Date(file.lastmod),
        weight: file.size,
        url: file.file,
        content: await client.getFileContents(`/${CURRENT_BLOG.name}/ressources/${file.file}`)
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function putMedia(client: any, media: Media) {
    return client.putFileContents(`/${CURRENT_BLOG.name}/ressources/${media.file}`, media.content, { overwrite: true })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deleteMedia(client: any, media: Media) {
    return client.deleteMedia(media.file);
} 

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchMedia(client: any, blog: Partial<Blog>): Promise<Media[]> {
    const files: WebdavFile[] = await client.getDirectoryContents(`/${blog.name}/ressources`);
    return await Promise.all(files.map((f) => parseMedia(client, f)))
}