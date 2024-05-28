import { HubConnection, HubConnectionBuilder, IHttpConnectionOptions, LogLevel } from '@microsoft/signalr';
import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { SessionService } from './session.service';
import { environment } from 'app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RealTimeHubService {
  messageReceived = new Subject<any>();
  updateNotifFromChatComponent = new Subject <number>();
  notificationReceived = new Subject<any>();

  private hubConnection: HubConnection;

  constructor(private session: SessionService) { }


  public createConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.url + '/ChatHub', { accessTokenFactory: () => this.session.token } as IHttpConnectionOptions)
      .withAutomaticReconnect([0, 2000, 10000, 30000, null])
      .configureLogging(LogLevel.None)
      .build();

    return this;
  }

  public startConnection(): void {
    this.hubConnection.start().then(async (r) => {
      console.log('Hub connection started');

      this.hubConnection.on('receiveMessage', res => this.messageReceived.next(res));

      this.hubConnection.on('notification', res => this.notificationReceived.next(res));

      this.hubConnection.on('innerException', res => {
        console.warn('##################################################################');
        console.warn(res);
        console.warn('##################################################################');
      });

    }).catch(e => {
      console.warn('Error while establishing connection signalr : ', e);
    });
  }

}
