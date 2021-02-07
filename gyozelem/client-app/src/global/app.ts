import { Broadcast } from './Broadcast';
import { GuestService } from '../services/guest-service';
import { styleChanger } from './Theme';
import { authService } from '../services/auth-service';
// import { globalStore } from './stores';
// import { plainToClass } from '../util/classTransform';
// import { LoggedUserData } from '../model/User';


async function loadLogic() {
    styleChanger();
    await Broadcast.getInstance();
    await authService.loadUsers();

    new GuestService();
    // // --- disabled the autologin since on server side this will be missmatched --
    // if (sessionStorage.getItem('user')) {
    //     const loggedUser = plainToClass(JSON.parse(sessionStorage.getItem('user')), LoggedUserData);
    //     globalStore.set('user', loggedUser);
    // }
}

function loadPage() {
    return new Promise((resolve) => {
        if (document.readyState === "complete" || document.readyState === "interactive") {
        resolve(true);
        }
        const cb = () => {
        resolve(true);
        window.removeEventListener('load', cb);
        }
        window.addEventListener('load', cb)          
    });
}

export async function bootstrap() {
    await loadPage();
    await loadLogic();    
}

async function globalScript() {
    /**
     * The code to be executed should be placed within a default function that is
     * exported by the global script. Ensure all of the code in the global script
     * is wrapped in the function() that is exported.
     */
}

export default globalScript;