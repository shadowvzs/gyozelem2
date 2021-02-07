import { broadcast } from "../global/Broadcast";
import { globalStore } from "../global/stores";

import { LoggedUserData, LoginUserData, SignUpUserData } from "../model/User";
import { array2ArrayMap } from "../util/core";
import { request } from "./request";

type Envelope<T> = {
    items: T[];
    itemCount: number;
}

export class AuthService {

    private request = request;

    public login = async (loginUserData: LoginUserData) => {
        try {
            const userData = await this.request.send<LoggedUserData>('/api/users/login', { 
                method: 'POST',
                data: loginUserData,
                responseType: 'json'
            });
            this.setUser(userData.data);
            broadcast.emit('notify:send', { type: 'success', message: `Udvozoljuk kedves ${userData.data.displayName}!` });
        } catch(err) {
            console.error(err);
            broadcast.emit('notify:send', { type: 'error', message: 'Valoszinu jelszo vagy a nev nem egyezik!' });
        }
    }

    private setUser(user: LoggedUserData | null) {
        globalStore.set('user', user);
        request.setToken(user?.token);
    }

    public logout = () => {
        this.setUser(null);
    }

    public signUp = async (signUpData: SignUpUserData) => {
        try {
            const userData = await this.request.send<LoggedUserData>('/api/users/register', { 
                method: 'POST',
                data: signUpData,
                responseType: 'json'
            });
            this.setUser(userData.data);
            broadcast.emit('notify:send', { type: 'success', message: `Udvozoljuk kedves ${userData.data.displayName}!` });
        } catch(err) {
            console.error(err);
            broadcast.emit('notify:send', { type: 'error', message: 'Registracio nem sikerult!' });
        }
    }

    public loadUsers = async () => {
        try {
            const users = await this.request.send<Envelope<LoggedUserData>>('/api/users', { method: 'GET', responseType: 'json' });
            const userMap = array2ArrayMap(users.data.items);
            globalStore.set('users', userMap);
        } catch (err) {
            console.error('User loading error: ', err);
        }
    }
}

export const authService = new AuthService();