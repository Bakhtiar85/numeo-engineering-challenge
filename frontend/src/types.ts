// frontend\src\types.ts
export interface SocketResposne {
    message: string;
    code: number | string;
    data?: string;
    errror?: string;
}