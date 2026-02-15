import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NotificationsGateway');
  private adminSocketId: string = null;

  afterInit() {
    this.logger.log('Init');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    if (client.id === this.adminSocketId) {
      this.adminSocketId = null;
      this.server.emit('admin-status', { online: false });
      this.logger.log('Admin disconnected');
    }
  }

  @SubscribeMessage('identity-admin')
  handleAdminIdentity(client: Socket) {
    this.adminSocketId = client.id;
    this.server.emit('admin-status', { online: true });
    this.logger.log(`Admin identified: ${client.id}`);
  }

  @SubscribeMessage('check-admin-status')
  handleCheckAdminStatus(client: Socket) {
    client.emit('admin-status', { online: !!this.adminSocketId });
  }

  sendNotification(notification: any) {
    this.server.emit('newNotification', notification);
  }
}
