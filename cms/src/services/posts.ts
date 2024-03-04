import { Post } from 'types/src/Post';
import { WebdavClient, WebdavFile } from '../types/webdav';
import yaml from 'yaml';
import { formatPost } from '../helpers/formatPost';
import { Blog } from 'types/src/Blog';

export function buildLink(server: string, client: WebdavClient, blog: Blog, post: Post) {
    // @ts-expect-error we use the otherwise unused variables to avoid production build to remove them
    return eval('`'+import.meta.env.VITE_POST_LINK_FORMAT+'`', server, client, blog, post);
}

export function deserializePost(p: Post): Post {
    return {
        ...p,
        updatedAt: new Date(p.updatedAt),
        createdAt: new Date(p.createdAt),
    }
}

function parsePost(meta: WebdavFile, raw: string): Post{
    const etyMetaRaw = raw.match(/---\n(.|\n)+\n---/gm);
    if(!etyMetaRaw) throw new Error("File is not a valid 11ty .md file");
    const etyMeta = etyMetaRaw[0].replace(/---/g, '');
    // TODO: add supports for tags
    const partialPost: Pick<Post, "title" | "description" | "createdAt" | "draft"> & { cover: string  } = yaml.parse(etyMeta);
    const content = raw.replace(etyMetaRaw[0], '');

    return {
        file: meta.basename,
        weight: meta.size,
        createdAt: new Date(partialPost.createdAt),
        updatedAt: new Date(meta.lastmod),
        cover: partialPost.cover,
        description: partialPost.description,
        title: partialPost.title,
        draft: partialPost.draft,
        content
    }
}

export function editPost(client: WebdavClient, post: Post) {
    const content = formatPost(post);
    return client.putFileContents(`/${import.meta.env.VITE_BLOGS_PATH}/${client.username}/${post.file}`, content, { overwrite: true }) as boolean
}

export function deletePost(client: WebdavClient, post: Post) {
    return client.deleteFile(`/${import.meta.env.VITE_BLOGS_PATH}/${client.username}/${post.file}`);
}

export async function fetchPosts(client: WebdavClient): Promise<Post[]> {
    const files: WebdavFile[] = await client.getDirectoryContents(`/${import.meta.env.VITE_BLOGS_PATH}/${client.username}`);
    const postsMeta = files.filter((f) => f.basename.endsWith(".md"));
    const postsData = await Promise.all(
        postsMeta
            .map((f) => client.getFileContents(f.filename, { format: "text" }))
    );
    const posts = postsMeta.map((meta, index) => {
        try {
            return parsePost(meta, postsData[index])
        } catch (e) {
            console.error(e);
            return null;
        }
    }).filter((f) => !!f) as Post[];
    return posts;
}