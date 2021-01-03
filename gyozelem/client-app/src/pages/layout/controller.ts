import { RouterHistory } from "@stencil/router";
import { globalStore } from "../../global/stores";
import { LoggedUserData, LoginUserData, SignUpUserData, User } from "../../model/User";
import { authService } from "../../services/auth-service";

export class LayoutController {

    public user: User;
    public history: RouterHistory;

    protected authService = authService;

    public get loggedUser(): LoggedUserData {
        return globalStore.get('user');
    }

    public login = (userData: LoginUserData) => {
        return this.authService.login(userData);
    }
    
    public logout = () => {
        return this.authService.logout();
    }

    public signUp = (userData: SignUpUserData) => {
        return this.authService.signUp(userData);
    }
}

export const layoutController = new LayoutController();
