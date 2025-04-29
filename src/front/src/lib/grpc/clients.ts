import { transport } from '@/lib/grpc/transport.ts';

import { AuthenticationServiceClient } from '../../../proto/App/authentication_service.client.ts';
import { ChatServiceClient } from '../../../proto/App/chat_service.client.ts';
import { StreamingBackFrontServiceClient } from '../../../proto/App/streaming_back_front_service.client.ts';
import { UnaryFrontBackServiceClient } from '../../../proto/App/unary_front_back_service.client.ts';

export const authService = new AuthenticationServiceClient(transport);
export const chatService = new ChatServiceClient(transport);
export const unaryService = new UnaryFrontBackServiceClient(transport);
export const streamingService = new StreamingBackFrontServiceClient(transport);
