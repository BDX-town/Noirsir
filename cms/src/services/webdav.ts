import { XMLParser } from 'fast-xml-parser';
import { WebdavFile } from "../types/webdav";

export class Webdav 
    // implements WebdavClient 
{
    private baseUrl: string;
    public username: string;
    public password: string;
    private parser: XMLParser;
    // createDirectory: (...a: any) => any;
    // createReadStream: (...a: any) => any;
    // createWriteStream: (...a: any) => any;
    // customRequest: (...a: any) => any;
    // exists: (...a: any) => any;
    // getFileDownloadLink: (...a: any) => any;
    // getFileUploadLink: (...a: any) => any;
    // getHeaders: (...a: any) => any;
    // getQuota: (...a: any) => any;
    // lock: (...a: any) => any;
    // moveFile: (...a: any) => any;
    // search: (...a: any) => any;
    // setHeaders: (...a: any) => any;
    // stat: (...a: any) => any;
    // unlock: (...a: any) => any;

    constructor(baseUrl: string, username: string, password: string) {
        this.username = username;
        this.password = password;
        this.baseUrl = baseUrl;
        this.parser = new XMLParser();
    }

    private request = (method: "GET" | "PUT" | "POST" | "DELETE" | "PROPFIND" | "COPY", uri: string, headers = {}, body?: BodyInit) => {
        return fetch(
            new URL(uri, this.baseUrl),
            {
                method,
                body,
                headers: {
                    ...headers,
                    Accept: "text/plain,application/xml",
                    "Authorization": `Basic ${btoa(`${this.username}:${this.password}`)}`
                }
            }
        )
    }

    public getDirectoryContents = async (uri: string) => {
        const response = await this.request("PROPFIND", uri, { Depth: "1"});
        if(!response.ok) return response;
        const data = await response.text();
        const xml = this.parser.parse(data);
        const responseData = xml["D:multistatus"]["D:response"]?.map ? xml["D:multistatus"]["D:response"] : [];
        const items = responseData
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ?.map((item: any) => ({
                basename: item["D:propstat"]["D:prop"]["D:displayname"],
                file: '',
                filename: item["D:href"],
                lastmod: item["D:propstat"]["D:prop"]["D:getlastmodified"],
                size: item["D:propstat"]["D:prop"]["D:getcontentlength"],
            } as WebdavFile))
            ?.filter((item: WebdavFile) => item.filename !== uri) || [];
        return new Response(JSON.stringify(items));
    }

    public getFileContents = (uri: string) => {
        return this.request("GET", uri);
    }

    public deleteFile = (uri: string) => {
        return this.request("DELETE", uri);
    }

    public putFileContents = async (uri: string, data: string | ArrayBuffer, opts: { overwrite: boolean }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const headers: any = { "Content-Type": "application/octet-stream"};
        if(!opts.overwrite) {
            headers["If-None-Match"] = "*";
        }       
        headers["If-Unmodified-Since"] = new Date().toUTCString();
        return this.request("PUT", uri, headers, data);
    }

    public copyFile = async (source: string, destination: string) => {
        return this.request("COPY", source, { "Destination": destination });
    }
}

export function createClient(baseUrl: string, opts: { username: string, password: string}) {
    return new Webdav(baseUrl, opts.username, opts.password);
}