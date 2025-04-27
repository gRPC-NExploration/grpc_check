import { transport } from '@/lib/grpc/transport.ts';

import { AuthenticationServiceClient } from '../../../proto/App/authentication_service.client.ts';
import { ChatServiceClient } from '../../../proto/App/chat_service.client.ts';

export const authService = new AuthenticationServiceClient(transport);
export const chatService = new ChatServiceClient(transport);
