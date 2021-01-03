import { whenPageReady } from '../util/dom';
import { Broadcast } from './Broadcast';
import { GuestService } from '../services/guest-service';
import { styleChanger } from './Theme';
// import { globalStore } from './stores';
// import { plainToClass } from '../util/classTransform';
// import { LoggedUserData } from '../model/User';

async function boostrap() {
    styleChanger();
    await Broadcast.getInstance();
    new GuestService();
    // // --- disabled the autologin since on server side this will be missmatched --
    // if (sessionStorage.getItem('user')) {
    //     const loggedUser = plainToClass(JSON.parse(sessionStorage.getItem('user')), LoggedUserData);
    //     globalStore.set('user', loggedUser);
    // }
}

export default async () => {
    /**
     * The code to be executed should be placed within a default function that is
     * exported by the global script. Ensure all of the code in the global script
     * is wrapped in the function() that is exported.
     */
    await whenPageReady;
    await boostrap();

};
