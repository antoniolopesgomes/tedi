export {ExpressApp} from './ExpressApp';
export interface App {
    listen(): Promise<any>;
    close(): Promise<any>;
}