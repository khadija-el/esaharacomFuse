import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { User } from '../Models/models';

const USER = 'USER';
const TOKEN = 'TOKEN';

const ADMIN = 'admin';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  public user = new User();
  public token = '';

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.getSession();
  }
  // se connecter
  public doSignIn(user: User, token) {
    if (!user || !token) {
      return;
    }
    this.user = user;
    this.token = token;
    this.myStorage.setItem(USER, (JSON.stringify(this.user)));
    this.myStorage.setItem(TOKEN, (JSON.stringify(this.token)));
  }

  public updateUser(user: User) {
    if (!user) {
      return;
    }
    this.user = user;
    this.myStorage.setItem(USER, (JSON.stringify(this.user)));
  }

  // se deconnecter
  public doSignOut(): void {
    this.user = new User();
    this.myStorage.removeItem(USER);
    this.myStorage.removeItem(TOKEN);
  }

  // this methode is for our auth guard
  get isSignedIn(): boolean {
    return (!!this.myStorage.getItem(USER)) || (!!this.myStorage.getItem(TOKEN));
  }

  public getSession(): void {
    try {
      this.user = JSON.parse(this.myStorage.getItem(USER));
      this.token = JSON.parse(this.myStorage.getItem(TOKEN));
    } catch (error) {
      this.user = new User();
      this.token = '';
    }
  }

//   get isAdmin() {
//     return this.user.role?.nom === 'admin';
//   }

//   get isSA() {
//     return this.user.role?.nom === 'sa';
//   }


//   get isUser() {
//     return this.user.role?.nom === 'user';
//   }

  get myStorage() {

    const isBrowser = isPlatformBrowser(this.platformId);


    if (isBrowser) {
      return {
        setItem: (key: string, value: string) => localStorage.setItem(key, value),
        getItem: (key: string) => localStorage.getItem(key),
        removeItem: (key: string) => localStorage.removeItem(key),
      }
    }

    var map: Map< string, string> = new Map();

    return {
      setItem: (key: string, value: string) => map.set(key, value),
      getItem: (key: string) => map.get(key),
      removeItem: (key: string) => map.delete(key),
    }
  }
}



