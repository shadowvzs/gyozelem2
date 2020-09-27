export declare namespace IRequest {

    interface Data<T> {
        data: T | any;
        error: any;
        message?: any;
    }

    type ApiResponse<T> = { 
        xhr: XMLHttpRequest;
        url: string;
        config: Config;
        data: T;
        duration: number;
    }

    type Response<T> = Promise<ApiResponse<T>>

    interface ConnectionError {
        code: number,
        message: string
    }

    type Callback = () => void;
    type ContentType = 'multipart/form-data' | 'application/x-www-form-urlencoded';
    type ResponseType = 'json' | 'text' | 'document' | 'blob' | 'arraybuffer';
    type EventCallback = (arg0: ProgressEvent) => void;

    interface Config {
        abort?: true | Callback;
        data?: Record<string, string | number | boolean | object | any>;
        file?: File;
        header?: Record<string, string | number>;
        method?: Method;
        progress?: EventCallback;
        contentType?: string;
        responseType?: ResponseType;
        timeoutLimit?: number;
    }

    type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

    interface InjectedServices {
        notify?: any;
    }
}

const baseConfig: Partial<IRequest.Config> = {
    header: {},
    method: 'GET',
    timeoutLimit: 10000,
    responseType: 'json',
}

class Request {

    private token: string = '';

    private serialize(obj: Record<string, any>, prefix?: string): string {
        const str: string[] = [];
        let p: string;
        for(p in obj) {
            if (obj.hasOwnProperty(p)) {
              const k = prefix ? prefix + "[" + p + "]" : p
              const v = obj[p];
              str.push((v !== null && typeof v === "object") ?
                this.serialize(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
        }
        return str.join("&");
    };

    public setToken(token: string) {
        this.token = token;
    }

    public send<T>(url: string, config: IRequest.Config = {}): IRequest.Response<T> {
        
        config = { ...baseConfig, ...config };

        const {
            file,
            header,
            method,
            responseType,
            timeoutLimit = 10000,
        } = { ...baseConfig, ...config } as IRequest.Config;

        let { contentType, data } = config;

        if (data && data.toJSON) { data = data.toJSON(); }

        if (method === 'GET' && data) {
            const query = this.serialize(data);
            if (query) url = url + (~url.indexOf("?") ? "&" : "?") + this.serialize(data);
        }

        const promise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const startAt: number = performance.now();
            xhr.open(method || 'GET', url, true);
            if (header && typeof header === 'object' ) Object.keys(header).forEach(k =>  xhr.setRequestHeader(k, "" + header[k]));
            if (this.token) xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);

            if (timeoutLimit) {
                xhr.timeout = timeoutLimit;
                xhr.ontimeout = () => {
                    reject({
                        code: 504,
                        message: 'Gateway Timeout',
                    } as IRequest.ConnectionError);
                };
            }

            if (config.abort) { config.abort = xhr.abort; }
            if (config.progress) { xhr.onprogress = config.progress; }

            xhr.responseType = responseType || 'json';
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const auth = (xhr.getResponseHeader('Authorization') || '').split('Bearer ');
                        const resp = xhr.response
                        if (auth.length === 2) { this.setToken(auth[1]); }
                        if (!resp || resp.error) {
                            return reject(resp ? resp.error : 'Request failed: ' + url,);
                        }
                        resolve({
                            xhr,
                            duration: performance.now() - startAt,
                            url,
                            config,
                            data: resp
                        });
                    } else {
                        reject({
                            code: xhr.status,
                            message: xhr.statusText,
                        } as IRequest.ConnectionError);
                    }
                }
            }

            if (!contentType) {
                if (data instanceof Blob) {
                    contentType = 'application/octet-stream';
                } else if (file) {
                    contentType = 'multipart/form-data';
                } else if (['POST', 'PUT'].includes(method)){
                    contentType = 'application/json; charset=utf-8';
                } else {
                    contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
                }
            }

            xhr.setRequestHeader('Content-Type', contentType);

            if (file) {
                const formData = new FormData();
                formData.append('file', file, file.name);
                formData.append('data', JSON.stringify(data));
                xhr.setRequestHeader('Content-Type', 'multipart/form-data');
                xhr.send(formData);
            } else if (data instanceof Blob) {
                xhr.send(data);
            } else if (method === "GET" || !data) {
                xhr.send(null);
            } else if (contentType.includes('json')) {
                console.log(JSON.stringify(data))
                xhr.send(JSON.stringify(data));
            } else {
                xhr.send(this.serialize(data));
            }
        });

        return promise as IRequest.Response<T>;
    }
}

export const request = new Request();
