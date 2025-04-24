import { transport } from '@/lib/grpc/transport.ts';

import { AuthenticationServiceClient } from '../../../proto/authentication_service.client.ts';
import { ChatServiceClient } from '../../../proto/chat_service.client.ts';

export const authService = new AuthenticationServiceClient(transport);
export const chatService = new ChatServiceClient(transport);
